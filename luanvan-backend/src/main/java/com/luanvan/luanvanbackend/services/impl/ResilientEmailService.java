package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.services.EmailService;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.function.Supplier;

@Service("resilientEmailService")
@Slf4j
public class ResilientEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;
    private final TimeLimiter timeLimiter;

    // Constructor with proper @Qualifier annotations
    public ResilientEmailService(
            JavaMailSender mailSender,
            @Qualifier("emailCircuitBreaker") CircuitBreaker circuitBreaker,
            @Qualifier("emailRetry") Retry retry,
            @Qualifier("emailTimeLimiter") TimeLimiter timeLimiter) {
        this.mailSender = mailSender;
        this.circuitBreaker = circuitBreaker;
        this.retry = retry;
        this.timeLimiter = timeLimiter;
    }

    @Value("${spring.mail.username:noreply@luanvan.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Async("emailTaskExecutor")
    public void sendWelcomeOnFirstAppointmentEmail(User user) {
        executeEmailOperation(() -> {
            log.info("Sending welcome email to user: {}", user.getEmail());
            
            String subject = "Chào mừng bạn đến với Hệ thống Đặt lịch Y tế!";
            String content = buildWelcomeEmailContent(user);
            
            sendHtmlEmailInternal(user.getEmail(), subject, content);
            log.info("Welcome email sent successfully to: {}", user.getEmail());
            
            return null;
        }, "sendWelcomeEmail", user.getEmail());
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentConfirmationEmail(Appointment appointment) {
        executeEmailOperation(() -> {
            log.info("Sending appointment confirmation email for appointment: {}", appointment.getAppointmentId());
            
            String subject = "Xác nhận lịch hẹn khám bệnh - " + appointment.getClinic().getName();
            String content = buildConfirmationEmailContent(appointment);
            
            sendHtmlEmailInternal(appointment.getPatient().getEmail(), subject, content);
            log.info("Confirmation email sent successfully for appointment: {}", appointment.getAppointmentId());
            
            return null;
        }, "sendConfirmationEmail", appointment.getPatient().getEmail());
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentReminderEmail(Appointment appointment) {
        executeEmailOperation(() -> {
            log.info("Sending appointment reminder email for appointment: {}", appointment.getAppointmentId());
            
            String subject = "Nhắc nhở lịch hẹn khám bệnh - " + appointment.getClinic().getName();
            String content = buildReminderEmailContent(appointment);
            
            sendHtmlEmailInternal(appointment.getPatient().getEmail(), subject, content);
            log.info("Reminder email sent successfully for appointment: {}", appointment.getAppointmentId());
            
            return null;
        }, "sendReminderEmail", appointment.getPatient().getEmail());
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentCancellationEmail(Appointment appointment, String reason) {
        executeEmailOperation(() -> {
            log.info("Sending appointment cancellation email for appointment: {}", appointment.getAppointmentId());
            
            String subject = "Thông báo hủy lịch hẹn - " + appointment.getClinic().getName();
            String content = buildCancellationEmailContent(appointment, reason);
            
            sendHtmlEmailInternal(appointment.getPatient().getEmail(), subject, content);
            log.info("Cancellation email sent successfully for appointment: {}", appointment.getAppointmentId());
            
            return null;
        }, "sendCancellationEmail", appointment.getPatient().getEmail());
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentUpdateEmail(Appointment appointment) {
        executeEmailOperation(() -> {
            log.info("Sending appointment update email for appointment: {}", appointment.getAppointmentId());
            
            String subject = "Cập nhật lịch hẹn khám bệnh - " + appointment.getClinic().getName();
            String content = buildUpdateEmailContent(appointment);
            
            sendHtmlEmailInternal(appointment.getPatient().getEmail(), subject, content);
            log.info("Update email sent successfully for appointment: {}", appointment.getAppointmentId());
            
            return null;
        }, "sendUpdateEmail", appointment.getPatient().getEmail());
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String content) {
        executeEmailOperation(() -> {
            sendSimpleEmailInternal(to, subject, content);
            return null;
        }, "sendSimpleEmail", to);
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        executeEmailOperation(() -> {
            sendHtmlEmailInternal(to, subject, htmlContent);
            return null;
        }, "sendHtmlEmail", to);
    }

    // Core resilient email execution method
    private void executeEmailOperation(Supplier<Void> emailOperation, String operationType, String recipient) {
        try {
            // Tạo ScheduledExecutorService cho TimeLimiter
            java.util.concurrent.ScheduledExecutorService scheduler = 
                java.util.concurrent.Executors.newScheduledThreadPool(1);
            
            // Tạo Supplier đơn giản cho CompletionStage
            Supplier<CompletableFuture<Void>> operation = () -> {
                return CompletableFuture.supplyAsync(emailOperation);
            };

            // Apply resilience patterns một cách tuần tự
            CompletableFuture<Void> result = timeLimiter.executeCompletionStage(
                scheduler, 
                operation
            ).toCompletableFuture().thenCompose(value -> {
                return circuitBreaker.executeCompletionStage(() -> 
                    CompletableFuture.completedFuture(value)
                ).toCompletableFuture();
            }).thenCompose(value -> {
                return retry.executeCompletionStage(
                    scheduler,
                    () -> CompletableFuture.completedFuture(value)
                ).toCompletableFuture();
            });

            result.whenComplete((success, throwable) -> {
                scheduler.shutdown(); // Cleanup scheduler
                if (throwable != null) {
                    handleEmailFailure(operationType, recipient, throwable);
                } else {
                    log.debug("Email operation {} completed successfully for {}", operationType, recipient);
                }
            });

        } catch (Exception e) {
            handleEmailFailure(operationType, recipient, e);
        }
    }

    private void handleEmailFailure(String operationType, String recipient, Throwable throwable) {
        log.error("Failed to execute email operation {} for recipient {}: {}", 
                operationType, recipient, throwable.getMessage());

        // In production, you might want to:
        // 1. Store failed emails in a queue for retry
        // 2. Send alerts to administrators
        // 3. Use alternative communication channels
        
        // For now, we'll just log and optionally queue for manual retry
        queueFailedEmail(operationType, recipient, throwable);
    }

    private void queueFailedEmail(String operationType, String recipient, Throwable error) {
        // This could be implemented with a message queue (RabbitMQ, Kafka, etc.)
        // For now, we'll just log the failure for manual investigation
        log.warn("Queuing failed email operation {} for recipient {} due to: {}", 
                operationType, recipient, error.getMessage());
        
        // TODO: Implement actual queue mechanism for production
        // Example: rabbitTemplate.send("failed-emails", new FailedEmailMessage(...));
    }

    // Internal email sending methods (no resilience applied - used within resilient wrapper)
    private void sendSimpleEmailInternal(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            log.debug("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending simple email to: " + to, e);
            throw new RuntimeException("Failed to send simple email", e);
        }
    }

    private void sendHtmlEmailInternal(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.debug("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending HTML email to: " + to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    // Email content building methods (reused from original EmailServiceImpl)
    private String buildWelcomeEmailContent(User user) {
        return String.format("""
            <html>
            <body>
                <h2>Chào mừng %s!</h2>
                <p>Cảm ơn bạn đã sử dụng dịch vụ đặt lịch hẹn y tế của chúng tôi.</p>
                <p>Bạn đã tạo thành công lịch hẹn đầu tiên. Chúng tôi cam kết mang đến cho bạn trải nghiệm tốt nhất.</p>
                <p><strong>Thông tin tài khoản:</strong></p>
                <ul>
                    <li>Họ tên: %s</li>
                    <li>Email: %s</li>
                    <li>Số điện thoại: %s</li>
                </ul>
                <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
                <br>
                <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
            </body>
            </html>
            """, 
            user.getFullName(), 
            user.getFullName(), 
            user.getEmail(), 
            user.getPhoneNumber() != null ? user.getPhoneNumber() : "Chưa cập nhật"
        );
    }

    private String buildConfirmationEmailContent(Appointment appointment) {
        return String.format("""
            <html>
            <body>
                <h2>Xác nhận lịch hẹn khám bệnh</h2>
                <p>Kính chào %s,</p>
                <p>Lịch hẹn của bạn đã được xác nhận thành công!</p>
                
                <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <h3>Thông tin lịch hẹn:</h3>
                    <p><strong>Mã lịch hẹn:</strong> #%d</p>
                    <p><strong>Bác sĩ:</strong> %s</p>
                    <p><strong>Chuyên khoa:</strong> %s</p>
                    <p><strong>Phòng khám:</strong> %s</p>
                    <p><strong>Thời gian:</strong> %s</p>
                    <p><strong>Lý do khám:</strong> %s</p>
                </div>
                
                <p><strong>Lưu ý quan trọng:</strong></p>
                <ul>
                    <li>Vui lòng có mặt trước 15 phút</li>
                    <li>Mang theo các giấy tờ cần thiết</li>
                    <li>Liên hệ phòng khám nếu có thay đổi</li>
                </ul>
                
                <p>Cảm ơn bạn đã tin tường và sử dụng dịch vụ!</p>
                <br>
                <p>Trân trọng,<br>%s</p>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getAppointmentId(),
            appointment.getDoctor().getFullName(),
            appointment.getSpecialty().getName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getReasonForVisit() != null ? appointment.getReasonForVisit() : "Khám tổng quát",
            appointment.getClinic().getName()
        );
    }

    private String buildReminderEmailContent(Appointment appointment) {
        return String.format("""
            <html>
            <body>
                <h2>Nhắc nhở lịch hẹn khám bệnh</h2>
                <p>Kính chào %s,</p>
                <p>Đây là thông báo nhắc nhở về lịch hẹn khám bệnh của bạn:</p>
                
                <div style="border: 1px solid #f0c419; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #fffbf0;">
                    <h3>🕐 Lịch hẹn sắp diễn ra:</h3>
                    <p><strong>Mã lịch hẹn:</strong> #%d</p>
                    <p><strong>Thời gian:</strong> %s</p>
                    <p><strong>Bác sĩ:</strong> %s</p>
                    <p><strong>Phòng khám:</strong> %s</p>
                    <p><strong>Địa chỉ:</strong> %s</p>
                </div>
                
                <p><strong>Chuẩn bị cho buổi khám:</strong></p>
                <ul>
                    <li>✅ Có mặt trước 15 phút</li>
                    <li>✅ Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                    <li>✅ Chuẩn bị các câu hỏi muốn tư vấn</li>
                </ul>
                
                <p>Nếu không thể đến được, vui lòng liên hệ để hủy/đổi lịch.</p>
                <br>
                <p>Chúc bạn có buổi khám thuận lợi!<br>%s</p>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getAppointmentId(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getDoctor().getFullName(),
            appointment.getClinic().getName(),
            appointment.getClinic().getAddress(),
            appointment.getClinic().getName()
        );
    }

    private String buildCancellationEmailContent(Appointment appointment, String reason) {
        return String.format("""
            <html>
            <body>
                <h2>Thông báo hủy lịch hẹn</h2>
                <p>Kính chào %s,</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn của bạn đã bị hủy.</p>
                
                <div style="border: 1px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #f8d7da;">
                    <h3>❌ Thông tin lịch hẹn đã hủy:</h3>
                    <p><strong>Mã lịch hẹn:</strong> #%d</p>
                    <p><strong>Thời gian:</strong> %s</p>
                    <p><strong>Bác sĩ:</strong> %s</p>
                    <p><strong>Phòng khám:</strong> %s</p>
                    <p><strong>Lý do hủy:</strong> %s</p>
                </div>
                
                <p><strong>Các bước tiếp theo:</strong></p>
                <ul>
                    <li>Bạn có thể đặt lịch hẹn mới bất kỳ lúc nào</li>
                    <li>Tiền đặt cọc (nếu có) sẽ được hoàn lại theo chính sách</li>
                    <li>Liên hệ chúng tôi nếu cần hỗ trợ</li>
                </ul>
                
                <p>Chúng tôi xin lỗi vì sự bất tiện này và mong được phục vụ bạn trong tương lai.</p>
                <br>
                <p>Trân trọng,<br>%s</p>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getAppointmentId(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getDoctor().getFullName(),
            appointment.getClinic().getName(),
            reason != null ? reason : "Không có lý do cụ thể",
            appointment.getClinic().getName()
        );
    }

    private String buildUpdateEmailContent(Appointment appointment) {
        return String.format("""
            <html>
            <body>
                <h2>Cập nhật thông tin lịch hẹn</h2>
                <p>Kính chào %s,</p>
                <p>Thông tin lịch hẹn của bạn đã được cập nhật:</p>
                
                <div style="border: 1px solid #17a2b8; padding: 15px; margin: 15px 0; border-radius: 5px; background-color: #d1ecf1;">
                    <h3>📝 Thông tin lịch hẹn mới:</h3>
                    <p><strong>Mã lịch hẹn:</strong> #%d</p>
                    <p><strong>Trạng thái:</strong> %s</p>
                    <p><strong>Thời gian:</strong> %s</p>
                    <p><strong>Bác sĩ:</strong> %s</p>
                    <p><strong>Phòng khám:</strong> %s</p>
                </div>
                
                <p>Vui lòng kiểm tra lại thông tin và sắp xếp thời gian phù hợp.</p>
                <p>Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
                <br>
                <p>Trân trọng,<br>%s</p>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getAppointmentId(),
            appointment.getStatus().name(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getDoctor().getFullName(),
            appointment.getClinic().getName(),
            appointment.getClinic().getName()
        );
    }
} 
package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@luanvan.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Async("emailTaskExecutor")
    public void sendWelcomeOnFirstAppointmentEmail(User user) {
        log.info("Sending welcome email to user: {}", user.getEmail());
        
        try {
            String subject = "Chào mừng bạn đến với Hệ thống Đặt lịch Y tế!";
            String content = buildWelcomeEmailContent(user);
            
            CompletableFuture.runAsync(() -> {
                sendHtmlEmail(user.getEmail(), subject, content);
                log.info("Welcome email sent successfully to: {}", user.getEmail());
            }).exceptionally(ex -> {
                log.error("Failed to send welcome email to: " + user.getEmail(), ex);
                return null;
            });
            
        } catch (Exception e) {
            log.error("Error sending welcome email to user: " + user.getEmail(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentConfirmationEmail(Appointment appointment) {
        log.info("Sending appointment confirmation email for appointment: {}", appointment.getAppointmentId());
        System.out.println("📧 EmailServiceImpl: Bắt đầu gửi email xác nhận");
        System.out.println("📧 To: " + appointment.getPatient().getEmail());
        System.out.println("📧 From: " + fromEmail);
        
        try {
            String subject = "🏥 Thông Tin Lịch Hẹn Khám Bệnh - " + appointment.getClinic().getName();
            String content = buildConfirmationEmailContent(appointment);
            
            System.out.println("📧 Subject: " + subject);
            System.out.println("📧 Content length: " + content.length());
            
            // Gửi email ngay lập tức thay vì async để debug
                sendHtmlEmail(appointment.getPatient().getEmail(), subject, content);
                log.info("Confirmation email sent successfully for appointment: {}", appointment.getAppointmentId());
            System.out.println("✅ Email xác nhận đã gửi thành công");
            
        } catch (Exception e) {
            log.error("Error sending confirmation email for appointment: " + appointment.getAppointmentId(), e);
            System.err.println("❌ Lỗi gửi email xác nhận: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentReminderEmail(Appointment appointment) {
        log.info("Sending appointment reminder email for appointment: {}", appointment.getAppointmentId());
        
        try {
            String subject = "Nhắc nhở lịch hẹn khám bệnh - " + appointment.getClinic().getName();
            String content = buildReminderEmailContent(appointment);
            
            CompletableFuture.runAsync(() -> {
                sendHtmlEmail(appointment.getPatient().getEmail(), subject, content);
                log.info("Reminder email sent successfully for appointment: {}", appointment.getAppointmentId());
            }).exceptionally(ex -> {
                log.error("Failed to send reminder email for appointment: " + appointment.getAppointmentId(), ex);
                return null;
            });
            
        } catch (Exception e) {
            log.error("Error sending reminder email for appointment: " + appointment.getAppointmentId(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentCancellationEmail(Appointment appointment, String reason) {
        log.info("Sending appointment cancellation email for appointment: {}", appointment.getAppointmentId());
        
        try {
            String subject = "Thông báo hủy lịch hẹn - " + appointment.getClinic().getName();
            String content = buildCancellationEmailContent(appointment, reason);
            
            CompletableFuture.runAsync(() -> {
                sendHtmlEmail(appointment.getPatient().getEmail(), subject, content);
                log.info("Cancellation email sent successfully for appointment: {}", appointment.getAppointmentId());
            }).exceptionally(ex -> {
                log.error("Failed to send cancellation email for appointment: " + appointment.getAppointmentId(), ex);
                return null;
            });
            
        } catch (Exception e) {
            log.error("Error sending cancellation email for appointment: " + appointment.getAppointmentId(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAppointmentUpdateEmail(Appointment appointment) {
        log.info("Sending appointment update email for appointment: {}", appointment.getAppointmentId());
        
        try {
            String subject = "Cập nhật lịch hẹn khám bệnh - " + appointment.getClinic().getName();
            String content = buildUpdateEmailContent(appointment);
            
            CompletableFuture.runAsync(() -> {
                sendHtmlEmail(appointment.getPatient().getEmail(), subject, content);
                log.info("Update email sent successfully for appointment: {}", appointment.getAppointmentId());
            }).exceptionally(ex -> {
                log.error("Failed to send update email for appointment: " + appointment.getAppointmentId(), ex);
                return null;
            });
            
        } catch (Exception e) {
            log.error("Error sending update email for appointment: " + appointment.getAppointmentId(), e);
        }
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Error sending simple email to: " + to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        System.out.println("📧 ===== SEND HTML EMAIL =====");
        System.out.println("📧 To: " + to);
        System.out.println("📧 From: " + fromEmail);
        System.out.println("📧 Subject: " + subject);
        System.out.println("📧 Content length: " + htmlContent.length());
        
        try {
            System.out.println("📧 Tạo MimeMessage...");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            System.out.println("📧 Set From: " + fromEmail);
            helper.setFrom(fromEmail);
            
            System.out.println("📧 Set To: " + to);
            helper.setTo(to);
            
            System.out.println("📧 Set Subject: " + subject);
            helper.setSubject(subject);
            
            System.out.println("📧 Set HTML content...");
            helper.setText(htmlContent, true);

            System.out.println("📧 Đang gửi email qua SMTP...");
            System.out.println("📧 SMTP Host: " + ((JavaMailSenderImpl) mailSender).getHost());
            System.out.println("📧 SMTP Port: " + ((JavaMailSenderImpl) mailSender).getPort());
            System.out.println("📧 SMTP Username: " + ((JavaMailSenderImpl) mailSender).getUsername());

            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
            System.out.println("✅ Email đã gửi thành công qua SMTP");
            System.out.println("📧 ===== HOÀN THÀNH SEND HTML EMAIL =====");
        } catch (MessagingException e) {
            log.error("Error sending HTML email to: " + to, e);
            System.err.println("❌ ===== LỖI SEND HTML EMAIL =====");
            System.err.println("❌ Lỗi SMTP: " + e.getMessage());
            System.err.println("❌ Exception type: " + e.getClass().getSimpleName());
            System.err.println("❌ Stack trace:");
            e.printStackTrace();
            System.err.println("❌ ===== KẾT THÚC LỖI SEND HTML EMAIL =====");
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    // Private methods for building email content
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
        String paymentStatus = appointment.isDepositPaid() ? "Đã thanh toán" : "Chưa thanh toán";
        String paymentNote = appointment.isDepositPaid() ? 
            "Lịch hẹn của bạn đã được xác nhận hoàn toàn." : 
            "Vui lòng thanh toán đặt cọc để xác nhận lịch hẹn.";
        
        // Thêm thông tin về số tiền đặt cọc nếu có
        String depositInfo = "";
        if (appointment.getDepositAmount() != null && appointment.getDepositAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
            depositInfo = String.format(" (Số tiền: %,.0f VNĐ)", appointment.getDepositAmount());
        }
        
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c5aa0; margin: 0;">🏥 Thông Tin Lịch Hẹn Khám Bệnh</h1>
                    </div>
                    
                    <p>Kính chào <strong>%s</strong>,</p>
                    <p>Cảm ơn bạn đã đặt lịch hẹn khám bệnh. Dưới đây là thông tin chi tiết:</p>
                
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="margin-top: 0; text-align: center;">📋 Thông Tin Lịch Hẹn</h2>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                            <div>
                                <strong>🔢 Mã lịch hẹn:</strong><br>
                                <span style="font-size: 18px; font-weight: bold;">#%d</span>
                            </div>
                            <div>
                                <strong>📅 Ngày giờ:</strong><br>
                                <span style="font-size: 16px;">%s</span>
                            </div>
                            <div>
                                <strong>👨‍⚕️ Bác sĩ:</strong><br>
                                <span style="font-size: 16px;">%s</span>
                            </div>
                            <div>
                                <strong>🏥 Chuyên khoa:</strong><br>
                                <span style="font-size: 16px;">%s</span>
                            </div>
                            <div>
                                <strong>🏢 Phòng khám:</strong><br>
                                <span style="font-size: 16px;">%s</span>
                            </div>
                            <div>
                                <strong>📍 Địa chỉ:</strong><br>
                                <span style="font-size: 16px;">%s</span>
                            </div>
                            <div>
                                <strong>💰 Trạng thái thanh toán:</strong><br>
                                <span style="font-size: 16px; color: %s;">%s%s</span>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <strong>📝 Lý do khám:</strong><br>
                            <span style="font-size: 16px;">%s</span>
                        </div>
                </div>
                
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c5aa0; margin-top: 0;">⚠️ Lưu Ý Quan Trọng</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>⏰ <strong>Vui lòng có mặt trước 15 phút</strong> so với giờ hẹn</li>
                            <li>📄 <strong>Mang theo:</strong> CMND/CCCD, thẻ BHYT (nếu có)</li>
                            <li>📞 <strong>Liên hệ:</strong> %s nếu cần thay đổi lịch hẹn</li>
                            <li>💳 <strong>Thanh toán:</strong> %s</li>
                </ul>
                    </div>
                    
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #2d5a2d; font-weight: bold;">
                            🎉 Chúc bạn có buổi khám thuận lợi và sức khỏe tốt!
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; margin: 0;">
                            Trân trọng,<br>
                            <strong>%s</strong><br>
                            <small>Hệ thống đặt lịch khám bệnh trực tuyến</small>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getAppointmentId(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getDoctor().getFullName(),
            appointment.getSpecialty().getName(),
            appointment.getClinic().getName(),
            appointment.getClinic().getAddress() != null ? appointment.getClinic().getAddress() : "Địa chỉ chưa cập nhật",
            appointment.isDepositPaid() ? "#28a745" : "#ffc107",
            paymentStatus,
            depositInfo,
            appointment.getReasonForVisit() != null ? appointment.getReasonForVisit() : "Khám tổng quát",
            appointment.getClinic().getPhoneNumber() != null ? appointment.getClinic().getPhoneNumber() : "Hotline: 1900 123 456",
            paymentNote,
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
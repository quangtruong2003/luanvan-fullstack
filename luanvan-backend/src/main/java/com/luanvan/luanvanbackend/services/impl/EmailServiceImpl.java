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
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
                    .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #ddd; }
                    .header h1 { color: #0056b3; margin: 0; }
                    .content { padding: 30px 20px; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Chào mừng bạn đến với Medical Care!</h1>
                    </div>
                    <div class="content">
                <h2>Chào mừng %s!</h2>
                        <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ đặt lịch hẹn y tế của chúng tôi.</p>
                        <p>Bạn đã tạo thành công lịch hẹn đầu tiên. Chúng tôi cam kết mang đến cho bạn trải nghiệm chăm sóc sức khỏe tốt nhất.</p>
                        <p><strong>Thông tin tài khoản của bạn:</strong></p>
                        <ul>
                            <li><strong>Họ tên:</strong> %s</li>
                            <li><strong>Email:</strong> %s</li>
                            <li><strong>Số điện thoại:</strong> %s</li>
                </ul>
                        <p>Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.</p>
                        <br>
                        <p>Trân trọng,<br>Đội ngũ Medical Care</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Medical Care. All rights reserved.</p>
                        <p>Đây là email tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
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
        String paymentStatus = appointment.isDepositPaid() ? "Đã thanh toán đặt cọc" : "Chờ thanh toán đặt cọc";
        String paymentNote = appointment.isDepositPaid() ? 
            "Lịch hẹn của bạn đã được xác nhận. Vui lòng đến đúng giờ." : 
            "Lịch hẹn của bạn đang ở trạng thái chờ. Vui lòng hoàn tất thanh toán đặt cọc để xác nhận lịch hẹn.";
        
        String depositInfo = "";
        if (appointment.getDepositAmount() != null && appointment.getDepositAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
            depositInfo = String.format("%,.0f VNĐ", appointment.getDepositAmount());
        }
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #4facfe 0%%, #00f2fe 100%%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; color: #555; }
                    .content h2 { color: #333; font-size: 22px; }
                    .appointment-details { background-color: #f9f9f9; border: 1px solid #eeeeee; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e9e9e9; }
                    .detail-item:last-child { border-bottom: none; }
                    .detail-item strong { color: #333; }
                    .cta-button { display: inline-block; background-color: #1a73e8; color: #ffffff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    .footer { background-color: #333; color: #bbb; padding: 20px; text-align: center; font-size: 12px; }
                    .footer a { color: #4facfe; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Xác Nhận Lịch Hẹn</h1>
                    </div>
                    <div class="content">
                        <h2>Chào %s,</h2>
                        <p>Cảm ơn bạn đã đặt lịch hẹn tại <strong>%s</strong>. Lịch hẹn của bạn đã được ghi nhận với các thông tin chi tiết dưới đây:</p>
                        
                        <div class="appointment-details">
                            <div class="detail-item"><strong>Mã lịch hẹn:</strong><span>#%d</span></div>
                            <div class="detail-item"><strong>Trạng thái:</strong><span style="font-weight: bold; color: %s;">%s</span></div>
                            <div class="detail-item"><strong>Bác sĩ:</strong><span>%s</span></div>
                            <div class="detail-item"><strong>Chuyên khoa:</strong><span>%s</span></div>
                            <div class="detail-item"><strong>Ngày giờ:</strong><span>%s</span></div>
                            <div class="detail-item"><strong>Địa chỉ:</strong><span>%s</span></div>
                            <div class="detail-item"><strong>Tiền đặt cọc:</strong><span>%s</span></div>
                        </div>
                        
                        <h3>Lưu ý quan trọng:</h3>
                        <ul>
                            <li>- Vui lòng có mặt trước giờ hẹn 15 phút để làm thủ tục.</li>
                            <li>- Mang theo CMND/CCCD, thẻ BHYT (nếu có) và các giấy tờ khám bệnh cũ.</li>
                            <li>- %s</li>
                </ul>
                    
                        <p style="text-align:center;">
                            <a href="#" class="cta-button">Quản lý lịch hẹn</a>
                        </p>
                        
                        <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline: %s.</p>
                        <p>Chúc bạn một ngày tốt lành!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 %s. All Rights Reserved.</p>
                        <p><a href="#">Chính sách bảo mật</a> | <a href="#">Liên hệ</a></p>
                    </div>
                </div>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.isDepositPaid() ? "#28a745" : "#f0ad4e",
            appointment.getStatus().toString(), // Using status directly from appointment
            appointment.getDoctor().getFullName(),
            appointment.getSpecialty().getName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getClinic().getAddress() != null ? appointment.getClinic().getAddress() : "N/A",
            depositInfo,
            paymentNote,
            appointment.getClinic().getPhoneNumber() != null ? appointment.getClinic().getPhoneNumber() : "N/A",
            appointment.getClinic().getName()
        );
    }

    private String buildReminderEmailContent(Appointment appointment) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #f5a623 0%%, #f76b1c 100%%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; color: #555; }
                    .content h2 { color: #333; font-size: 22px; }
                    .appointment-details { background-color: #fffaf0; border: 1px solid #ffeeba; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fff0c7; }
                    .detail-item:last-child { border-bottom: none; }
                    .detail-item strong { color: #333; }
                    .cta-button { display: inline-block; background-color: #1a73e8; color: #ffffff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    .footer { background-color: #333; color: #bbb; padding: 20px; text-align: center; font-size: 12px; }
                    .footer a { color: #f5a623; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Nhắc Nhở Lịch Hẹn</h1>
                    </div>
                    <div class="content">
                        <h2>Chào %s,</h2>
                        <p>Đây là lời nhắc nhở thân thiện về lịch hẹn sắp tới của bạn tại <strong>%s</strong>.</p>
                        
                        <div class="appointment-details">
                            <div class="detail-item"><strong>Mã lịch hẹn:</strong><span>#%d</span></div>
                            <div class="detail-item"><strong>Bác sĩ:</strong><span>%s</span></div>
                            <div class="detail-item"><strong>Ngày giờ:</strong><span>%s</span></div>
                </div>
                
                        <h3>Vui lòng chuẩn bị:</h3>
                <ul>
                            <li>- Có mặt trước 15 phút để làm thủ tục.</li>
                            <li>- Mang theo giấy tờ tùy thân và các kết quả khám bệnh cũ (nếu có).</li>
                </ul>
                
                        <p style="text-align:center;">
                            <a href="#" class="cta-button">Xem chi tiết lịch hẹn</a>
                        </p>
                        
                        <p>Nếu bạn không thể đến, vui lòng hủy hoặc dời lịch sớm. Trân trọng cảm ơn!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 %s. All Rights Reserved.</p>
                        <p><a href="#">Chính sách bảo mật</a> | <a href="#">Liên hệ</a></p>
                    </div>
                </div>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getDoctor().getFullName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getClinic().getName()
        );
    }

    private String buildCancellationEmailContent(Appointment appointment, String reason) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #d62828 0%%, #f77f00 100%%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; color: #555; }
                    .content h2 { color: #333; font-size: 22px; }
                    .appointment-details { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .detail-item { padding: 8px 0; }
                    .detail-item strong { color: #721c24; }
                    .cta-button { display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    .footer { background-color: #333; color: #bbb; padding: 20px; text-align: center; font-size: 12px; }
                    .footer a { color: #d62828; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Thông Báo Hủy Lịch Hẹn</h1>
                    </div>
                    <div class="content">
                        <h2>Chào %s,</h2>
                        <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn của bạn tại <strong>%s</strong> đã được hủy.</p>
                        
                        <div class="appointment-details">
                            <div class="detail-item"><strong>Mã lịch hẹn:</strong> #%d</div>
                            <div class="detail-item"><strong>Thời gian dự kiến:</strong> %s</div>
                            <div class="detail-item"><strong>Lý do hủy:</strong> %s</div>
                        </div>
                        
                        <p>Nếu việc hủy này là một sự nhầm lẫn hoặc bạn muốn đặt lại lịch, vui lòng liên hệ với chúng tôi qua hotline hoặc đặt lịch mới qua hệ thống.</p>
                        <p>Tiền đặt cọc (nếu có) sẽ được xử lý theo chính sách của phòng khám.</p>
                        
                        <p style="text-align:center;">
                            <a href="#" class="cta-button">Đặt lịch hẹn mới</a>
                        </p>
                        
                        <p>Chúng tôi xin lỗi vì sự bất tiện này và mong được phục vụ bạn trong lần tới.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 %s. All Rights Reserved.</p>
                        <p><a href="#">Chính sách bảo mật</a> | <a href="#">Liên hệ</a></p>
                    </div>
                </div>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            reason != null && !reason.isEmpty() ? reason : "Không có lý do cụ thể",
            appointment.getClinic().getName()
        );
    }

    private String buildUpdateEmailContent(Appointment appointment) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 40px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; color: #555; }
                    .content h2 { color: #333; font-size: 22px; }
                    .appointment-details { background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #c7d2fe; }
                    .detail-item:last-child { border-bottom: none; }
                    .detail-item strong { color: #333; }
                    .cta-button { display: inline-block; background-color: #1a73e8; color: #ffffff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; }
                    .footer { background-color: #333; color: #bbb; padding: 20px; text-align: center; font-size: 12px; }
                    .footer a { color: #667eea; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Cập Nhật Lịch Hẹn</h1>
                    </div>
                    <div class="content">
                        <h2>Chào %s,</h2>
                        <p>Lịch hẹn của bạn tại <strong>%s</strong> đã có một số thay đổi. Vui lòng xem thông tin cập nhật dưới đây:</p>
                        
                        <div class="appointment-details">
                            <div class="detail-item"><strong>Mã lịch hẹn:</strong><span> #%d</span></div>
                            <div class="detail-item"><strong>Trạng thái mới:</strong><span style="font-weight: bold; color: #3b82f6;"> %s</span></div>
                            <div class="detail-item"><strong>Ngày giờ:</strong><span> %s</span></div>
                            <div class="detail-item"><strong>Bác sĩ:</strong><span> %s</span></div>
                        </div>
                        
                        <p>Vui lòng kiểm tra lại thông tin và sắp xếp thời gian của bạn. Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi.</p>
                        
                        <p style="text-align:center;">
                            <a href="#" class="cta-button">Xem chi tiết trên hệ thống</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 %s. All Rights Reserved.</p>
                        <p><a href="#">Chính sách bảo mật</a> | <a href="#">Liên hệ</a></p>
                    </div>
                </div>
            </body>
            </html>
            """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getStatus().toString(), // Using status from appointment
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getDoctor().getFullName(),
            appointment.getClinic().getName()
        );
    }
} 
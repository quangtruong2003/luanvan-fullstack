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
        try {
            String subject = "🏥 Thông Tin Lịch Hẹn Khám Bệnh - " + appointment.getClinic().getName();
            String content = buildConfirmationEmailContent(appointment);

            CompletableFuture.runAsync(() -> {
                sendHtmlEmail(appointment.getPatient().getEmail(), subject, content);
                log.info("Confirmation email sent successfully for appointment: {}", appointment.getAppointmentId());
            }).exceptionally(ex -> {
                log.error("Failed to send confirmation email for appointment: " + appointment.getAppointmentId(), ex);
                return null;
            });

        } catch (Exception e) {
            log.error("Error sending confirmation email for appointment: " + appointment.getAppointmentId(), e);
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
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Error sending HTML email to: " + to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    // Private methods for building email content
    private String buildWelcomeEmailContent(User user) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chào mừng đến với Medical.Care</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f0f8ff; }
                    .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #00b4d8 0%%, #0077b6 50%%, #023e8a 100%%); color: white; padding: 50px 30px; text-align: center; position: relative; }
                    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="medical" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%%23medical)"/></svg>'); }
                    .header .logo { font-size: 32px; font-weight: 700; margin-bottom: 10px; position: relative; z-index: 1; }
                    .header .tagline { font-size: 16px; opacity: 0.9; position: relative; z-index: 1; }
                    .medical-icon { width: 60px; height: 60px; margin: 0 auto 20px; background: rgba(255,255,255,0.2); border-radius: 50%%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
                    .content { padding: 50px 40px; }
                    .welcome-title { color: #023e8a; font-size: 28px; font-weight: 600; margin-bottom: 20px; text-align: center; }
                    .welcome-message { font-size: 16px; color: #555; margin-bottom: 30px; text-align: center; line-height: 1.8; }
                    .user-info-card { background: linear-gradient(135deg, #f8fdff 0%%, #e6f7ff 100%%); border-left: 4px solid #00b4d8; padding: 25px; border-radius: 12px; margin: 30px 0; }
                    .user-info-title { color: #023e8a; font-size: 18px; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .info-item { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                    .info-label { font-size: 12px; color: #0077b6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                    .info-value { font-size: 14px; color: #333; font-weight: 500; }
                    .features-section { margin: 30px 0; }
                    .features-title { color: #023e8a; font-size: 20px; font-weight: 600; margin-bottom: 20px; text-align: center; }
                    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                    .feature-item { text-align: center; padding: 20px; background: #f8fdff; border-radius: 12px; border: 1px solid #e6f7ff; }
                    .feature-icon { width: 40px; height: 40px; background: #00b4d8; border-radius: 50%%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
                    .feature-title { font-size: 14px; font-weight: 600; color: #023e8a; margin-bottom: 8px; }
                    .feature-desc { font-size: 12px; color: #666; line-height: 1.5; }
                    .cta-section { text-align: center; margin: 40px 0; }
                    .cta-button { display: inline-block; background: linear-gradient(135deg, #00b4d8 0%%, #0077b6 100%%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 5px 15px rgba(0,180,216,0.3); transition: all 0.3s ease; }
                    .footer { background: #023e8a; color: white; padding: 30px; text-align: center; }
                    .footer-content { margin-bottom: 20px; }
                    .footer-logo { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
                    .footer-links { margin: 15px 0; }
                    .footer-links a { color: #90cdf4; text-decoration: none; margin: 0 15px; font-size: 14px; }
                    .footer-bottom { font-size: 12px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
                    @media (max-width: 600px) {
                        .email-container { margin: 10px; border-radius: 12px; }
                        .header { padding: 30px 20px; }
                        .content { padding: 30px 20px; }
                        .info-grid { grid-template-columns: 1fr; }
                        .features-grid { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <div class="medical-icon">
                            <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                                <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM18 18H6V6h12v12zm-7-7H9V9h2V7h2v2h2v2h-2v2h-2v-2z"/>
                            </svg>
                        </div>
                        <div class="logo">Medical.Care</div>
                        <div class="tagline">Chăm sóc sức khỏe chuyên nghiệp</div>
                    </div>
                    
                    <div class="content">
                        <h1 class="welcome-title">🎉 Chào mừng %s đến với Medical.Care!</h1>
                        
                        <p class="welcome-message">
                            Cảm ơn bạn đã tin tưởng và chọn Medical.Care làm đối tác chăm sóc sức khỏe. 
                            Chúng tôi cam kết mang đến cho bạn dịch vụ y tế chất lượng cao với công nghệ hiện đại nhất.
                        </p>
                        
                        <div class="user-info-card">
                            <div class="user-info-title">
                                <svg width="20" height="20" fill="#023e8a" viewBox="0 0 24 24" style="margin-right: 10px;">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                                Thông tin tài khoản của bạn
                            </div>
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">Họ và tên</div>
                                    <div class="info-value">%s</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Email</div>
                                    <div class="info-value">%s</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Số điện thoại</div>
                                    <div class="info-value">%s</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">Trạng thái</div>
                                    <div class="info-value" style="color: #28a745; font-weight: 600;">✅ Đã kích hoạt</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="features-section">
                            <h2 class="features-title">Các tính năng nổi bật của Medical.Care</h2>
                            <div class="features-grid">
                                <div class="feature-item">
                                    <div class="feature-icon">📅</div>
                                    <div class="feature-title">Đặt lịch dễ dàng</div>
                                    <div class="feature-desc">Đặt lịch khám bệnh 24/7 với giao diện thân thiện</div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">👨‍⚕️</div>
                                    <div class="feature-title">Bác sĩ chuyên nghiệp</div>
                                    <div class="feature-desc">Đội ngũ bác sĩ giàu kinh nghiệm và tận tâm</div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">📱</div>
                                    <div class="feature-title">Quản lý thông minh</div>
                                    <div class="feature-desc">Theo dõi lịch sử khám bệnh và nhắc nhở tự động</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cta-section">
                            <a href="#" class="cta-button">Khám phá Medical.Care ngay</a>
                        </div>
                        
                        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                            Cần hỗ trợ? Liên hệ với chúng tôi qua <a href="mailto:support@medical.care" style="color: #00b4d8;">support@medical.care</a> 
                            hoặc hotline <strong style="color: #023e8a;">1900 123 456</strong>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-content">
                            <div class="footer-logo">Medical.Care</div>
                            <div style="font-size: 14px; margin-bottom: 15px;">Nền tảng chăm sóc sức khỏe hàng đầu Việt Nam</div>
                            <div class="footer-links">
                                <a href="#">Về chúng tôi</a>
                                <a href="#">Dịch vụ</a>
                                <a href="#">Liên hệ</a>
                                <a href="#">Chính sách bảo mật</a>
                            </div>
                        </div>
                        <div class="footer-bottom">
                            <p>&copy; 2025 Medical.Care. Tất cả quyền được bảo lưu.</p>
                            <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
                        </div>
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
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Xác nhận lịch hẹn</title>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap' rel='stylesheet'>
        </head>
        <body style='margin:0;padding:0;font-family:Inter,Roboto,Arial,sans-serif;background:#f7f8fa;'>
            <table width='100%%' cellpadding='0' cellspacing='0' style='background:#f7f8fa;'>
                <tr><td align='center'>
                    <table width='100%%' style='max-width:480px;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;margin:32px 0;padding:0 0 24px 0;'>
                        <tr><td style='padding:32px 24px 8px 24px;text-align:center;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/3209/3209265.png' width='64' alt='Medical.Care' style='margin-bottom:16px;border-radius:12px;'>
                            <h2 style='margin:0 0 8px 0;font-size:1.5rem;color:#1976d2;'>Xác nhận lịch hẹn thành công</h2>
                            <div style='color:#333;font-size:1.1rem;margin-bottom:8px;'>Chào %s, cảm ơn bạn đã đặt lịch tại <b>%s</b>!</div>
                            <div style='color:#666;font-size:1rem;margin-bottom:16px;'>%s</div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='background:#f1f5fb;border-radius:12px;padding:20px 16px;margin-bottom:18px;'>
                                <div style='font-size:1.1rem;font-weight:600;color:#1976d2;margin-bottom:8px;'>Thông tin lịch hẹn</div>
                                <div style='margin-bottom:6px;'><b>Mã lịch hẹn:</b> #%s</div>
                                <div style='margin-bottom:6px;'><b>Bác sĩ:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Chuyên khoa:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Thời gian:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Địa chỉ:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Trạng thái:</b> <span style='color:%s;font-weight:600;'>%s</span></div>
                                <div style='margin-bottom:6px;'><b>Tiền đặt cọc:</b> %s</div>
                            </div>
                            <div style='margin-bottom:18px;text-align:center;'>
                                <a href='https://medical.care/lich-hen' style='display:inline-block;padding:12px 28px;background:#1976d2;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;margin-right:8px;'>Xem chi tiết</a>
                                <a href='https://medical.care/lich-hen/doi' style='display:inline-block;padding:12px 28px;background:#e3e6ea;color:#1976d2;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;'>Đổi lịch</a>
                            </div>
                            <div style='background:#fffbe6;border-radius:8px;padding:12px 16px;color:#b26a00;font-size:0.98rem;margin-bottom:18px;'>
                                <b>Lưu ý:</b> %s
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:18px 0 0 0;font-size:0.97rem;color:#666;'>
                                Nếu có thắc mắc, vui lòng liên hệ <b>Hotline: %s</b> hoặc trả lời email này.<br>
                                <span style='color:#aaa;font-size:0.95rem;'>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</span>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:24px 0 0 0;text-align:center;color:#bbb;font-size:0.95rem;'>
                                &copy; 2025 Medical.Care. All rights reserved.
                            </div>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            paymentNote,
            appointment.getAppointmentId(),
            appointment.getDoctor().getFullName(),
            appointment.getSpecialty().getName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getClinic().getAddress() != null ? appointment.getClinic().getAddress() : "Đang cập nhật",
            appointment.isDepositPaid() ? "#388e3c" : "#f57c00",
            paymentStatus,
            depositInfo.isEmpty() ? "Miễn phí" : depositInfo,
            paymentNote,
            appointment.getClinic().getPhoneNumber() != null ? appointment.getClinic().getPhoneNumber() : "1900 123 456"
        );
    }

    private String buildReminderEmailContent(Appointment appointment) {
        return String.format("""
        <!DOCTYPE html>
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Nhắc nhở lịch hẹn</title>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap' rel='stylesheet'>
        </head>
        <body style='margin:0;padding:0;font-family:Inter,Roboto,Arial,sans-serif;background:#fff8e1;'>
            <table width='100%%' cellpadding='0' cellspacing='0' style='background:#fff8e1;'>
                <tr><td align='center'>
                    <table width='100%%' style='max-width:480px;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;margin:32px 0;padding:0 0 24px 0;'>
                        <tr><td style='padding:32px 24px 8px 24px;text-align:center;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/3652/3652267.png' width='64' alt='Medical.Care' style='margin-bottom:16px;border-radius:12px;'>
                            <h2 style='margin:0 0 8px 0;font-size:1.5rem;color:#ff9800;'>⏰ Nhắc nhở lịch hẹn</h2>
                            <div style='color:#333;font-size:1.1rem;margin-bottom:8px;'>Chào %s, bạn có lịch hẹn sắp tới!</div>
                            <div style='color:#666;font-size:1rem;margin-bottom:16px;'>Đừng quên cuộc hẹn quan trọng tại <b>%s</b></div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='background:#fff3e0;border-radius:12px;padding:20px 16px;margin-bottom:18px;'>
                                <div style='font-size:1.1rem;font-weight:600;color:#ff9800;margin-bottom:8px;'>🚨 Lịch hẹn sắp diễn ra</div>
                                <div style='margin-bottom:6px;'><b>Mã lịch hẹn:</b> #%s</div>
                                <div style='margin-bottom:6px;'><b>Bác sĩ:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Thời gian:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Địa chỉ:</b> %s</div>
                            </div>
                            <div style='background:#e8f5e8;border-radius:8px;padding:12px 16px;color:#2e7d32;font-size:0.98rem;margin-bottom:18px;'>
                                <b>✅ Chuẩn bị:</b> Có mặt trước 15 phút, mang CMND/CCCD và thẻ BHYT (nếu có)
                            </div>
                            <div style='margin-bottom:18px;text-align:center;'>
                                <a href='https://medical.care/lich-hen' style='display:inline-block;padding:12px 28px;background:#ff9800;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;margin-right:8px;'>Xem chi tiết</a>
                                <a href='https://medical.care/lich-hen/doi' style='display:inline-block;padding:12px 28px;background:#e3e6ea;color:#ff9800;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;'>Đổi lịch</a>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:18px 0 0 0;font-size:0.97rem;color:#666;'>
                                Nếu có thắc mắc, vui lòng liên hệ <b>Hotline: 1900 123 456</b> hoặc trả lời email này.<br>
                                <span style='color:#aaa;font-size:0.95rem;'>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</span>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:24px 0 0 0;text-align:center;color:#bbb;font-size:0.95rem;'>
                                &copy; 2025 Medical.Care. All rights reserved.
                            </div>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getDoctor().getFullName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            appointment.getClinic().getAddress() != null ? appointment.getClinic().getAddress() : "Đang cập nhật"
        );
    }

    private String buildCancellationEmailContent(Appointment appointment, String reason) {
        return String.format("""
        <!DOCTYPE html>
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Thông báo hủy lịch hẹn</title>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap' rel='stylesheet'>
        </head>
        <body style='margin:0;padding:0;font-family:Inter,Roboto,Arial,sans-serif;background:#ffebee;'>
            <table width='100%%' cellpadding='0' cellspacing='0' style='background:#ffebee;'>
                <tr><td align='center'>
                    <table width='100%%' style='max-width:480px;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;margin:32px 0;padding:0 0 24px 0;'>
                        <tr><td style='padding:32px 24px 8px 24px;text-align:center;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/753/753345.png' width='64' alt='Medical.Care' style='margin-bottom:16px;border-radius:12px;'>
                            <h2 style='margin:0 0 8px 0;font-size:1.5rem;color:#f44336;'>❌ Lịch hẹn đã hủy</h2>
                            <div style='color:#333;font-size:1.1rem;margin-bottom:8px;'>Kính chào %s, chúng tôi xin lỗi vì sự bất tiện này</div>
                            <div style='color:#666;font-size:1rem;margin-bottom:16px;'>Lịch hẹn tại <b>%s</b> đã bị hủy bỏ</div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='background:#ffcdd2;border-radius:12px;padding:20px 16px;margin-bottom:18px;'>
                                <div style='font-size:1.1rem;font-weight:600;color:#d32f2f;margin-bottom:8px;'>🚫 Lịch hẹn đã bị hủy</div>
                                <div style='margin-bottom:6px;'><b>Mã lịch hẹn:</b> #%s</div>
                                <div style='margin-bottom:6px;'><b>Thời gian dự kiến:</b> %s</div>
                                <div style='color:#666;font-size:0.95rem;margin-top:8px;'>Chúng tôi chân thành xin lỗi về sự bất tiện này</div>
                            </div>
                            <div style='background:#fff3e0;border-radius:8px;padding:12px 16px;color:#e65100;font-size:0.98rem;margin-bottom:18px;'>
                                <b>📝 Lý do:</b> %s
                            </div>
                            <div style='background:#e8f5e8;border-radius:8px;padding:12px 16px;color:#2e7d32;font-size:0.98rem;margin-bottom:18px;'>
                                <b>💰 Hoàn tiền:</b> Phí đặt lịch sẽ được hoàn trả trong 3-5 ngày làm việc
                            </div>
                            <div style='margin-bottom:18px;text-align:center;'>
                                <a href='https://medical.care/dat-lich' style='display:inline-block;padding:12px 28px;background:#4caf50;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;margin-right:8px;'>Đặt lịch mới</a>
                                <a href='https://medical.care/support' style='display:inline-block;padding:12px 28px;background:#e3e6ea;color:#f44336;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;'>Liên hệ hỗ trợ</a>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:18px 0 0 0;font-size:0.97rem;color:#666;'>
                                Nếu có thắc mắc, vui lòng liên hệ <b>Hotline: 1900 123 456</b> hoặc trả lời email này.<br>
                                <span style='color:#aaa;font-size:0.95rem;'>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</span>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:24px 0 0 0;text-align:center;color:#bbb;font-size:0.95rem;'>
                                &copy; 2025 Medical.Care. All rights reserved.
                            </div>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER),
            reason != null && !reason.isEmpty() ? reason : "Không có lý do cụ thể được cung cấp"
        );
    }

    private String buildUpdateEmailContent(Appointment appointment) {
        return String.format("""
        <!DOCTYPE html>
        <html lang='vi'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Cập nhật lịch hẹn</title>
            <link href='https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap' rel='stylesheet'>
        </head>
        <body style='margin:0;padding:0;font-family:Inter,Roboto,Arial,sans-serif;background:#f0f4ff;'>
            <table width='100%%' cellpadding='0' cellspacing='0' style='background:#f0f4ff;'>
                <tr><td align='center'>
                    <table width='100%%' style='max-width:480px;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;margin:32px 0;padding:0 0 24px 0;'>
                        <tr><td style='padding:32px 24px 8px 24px;text-align:center;'>
                            <img src='https://cdn-icons-png.flaticon.com/512/3652/3652267.png' width='64' alt='Medical.Care' style='margin-bottom:16px;border-radius:12px;'>
                            <h2 style='margin:0 0 8px 0;font-size:1.5rem;color:#2196f3;'>🔄 Lịch hẹn được cập nhật</h2>
                            <div style='color:#333;font-size:1.1rem;margin-bottom:8px;'>Chào %s, lịch hẹn của bạn có thay đổi</div>
                            <div style='color:#666;font-size:1rem;margin-bottom:16px;'>Thông tin mới tại <b>%s</b></div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='background:#e3f2fd;border-radius:12px;padding:20px 16px;margin-bottom:18px;'>
                                <div style='font-size:1.1rem;font-weight:600;color:#1976d2;margin-bottom:8px;'>📋 Thông tin lịch hẹn mới</div>
                                <div style='margin-bottom:6px;'><b>Mã lịch hẹn:</b> #%s</div>
                                <div style='margin-bottom:6px;'><b>Trạng thái:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Bác sĩ:</b> %s</div>
                                <div style='margin-bottom:6px;'><b>Thời gian:</b> %s</div>
                            </div>
                            <div style='background:#fff3e0;border-radius:8px;padding:12px 16px;color:#e65100;font-size:0.98rem;margin-bottom:18px;'>
                                <b>⚠️ Lưu ý:</b> Vui lòng kiểm tra thông tin mới và sắp xếp thời gian phù hợp
                            </div>
                            <div style='margin-bottom:18px;text-align:center;'>
                                <a href='https://medical.care/lich-hen' style='display:inline-block;padding:12px 28px;background:#2196f3;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;margin-right:8px;'>Xem chi tiết</a>
                                <a href='https://medical.care/support' style='display:inline-block;padding:12px 28px;background:#e3e6ea;color:#2196f3;border-radius:8px;font-weight:600;text-decoration:none;font-size:1rem;'>Liên hệ hỗ trợ</a>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:18px 0 0 0;font-size:0.97rem;color:#666;'>
                                Nếu có thắc mắc, vui lòng liên hệ <b>Hotline: 1900 123 456</b> hoặc trả lời email này.<br>
                                <span style='color:#aaa;font-size:0.95rem;'>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</span>
                            </div>
                        </td></tr>
                        <tr><td style='padding:0 24px;'>
                            <div style='margin:24px 0 0 0;text-align:center;color:#bbb;font-size:0.95rem;'>
                                &copy; 2025 Medical.Care. All rights reserved.
                            </div>
                        </td></tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        """,
            appointment.getPatient().getFullName(),
            appointment.getClinic().getName(),
            appointment.getAppointmentId(),
            appointment.getStatus().toString(),
            appointment.getDoctor().getFullName(),
            appointment.getAppointmentDateTime().format(DATE_FORMATTER)
        );
    }
} 
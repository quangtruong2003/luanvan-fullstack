package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@luanvan.com}")
    private String fromEmail;

    @Override
    public void sendWelcomeOnFirstAppointmentEmail(User user) {
        String subject = "Chào mừng bạn đến với Hệ thống Đặt lịch Y tế";
        String content = String.format(
                "Xin chào %s,\n\n" +
                "Chào mừng bạn đến với Hệ thống Đặt lịch Y tế!\n" +
                "Chúng tôi rất vui khi bạn đã chọn sử dụng dịch vụ của chúng tôi.\n\n" +
                "Thông tin tài khoản của bạn:\n" +
                "- Họ tên: %s\n" +
                "- Email: %s\n" +
                "%s\n\n" +
                "Bạn có thể theo dõi lịch hẹn và quản lý thông tin cá nhân thông qua hệ thống của chúng tôi.\n\n" +
                "Cảm ơn bạn đã tin tượng và sử dụng dịch vụ!\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Hệ thống Đặt lịch Y tế",
                user.getFullName(),
                user.getFullName(),
                user.getEmail() != null ? user.getEmail() : "Chưa cập nhật",
                user.getPhoneNumber() != null ? "- Số điện thoại: " + user.getPhoneNumber() : "- Số điện thoại: Chưa cập nhật"
        );
        
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            sendSimpleEmail(user.getEmail(), subject, content);
        }
    }

    @Override
    public void sendAppointmentConfirmationEmail(Appointment appointment) {
        if (appointment.getPatient().getEmail() == null || appointment.getPatient().getEmail().isEmpty()) {
            log.info("Không có email để gửi xác nhận lịch hẹn cho bệnh nhân: {}", appointment.getPatient().getFullName());
            return;
        }

        String subject = "Xác nhận lịch hẹn - Hệ thống Y tế";
        String content = String.format(
                "Xin chào %s,\n\n" +
                "Lịch hẹn của bạn đã được xác nhận với thông tin sau:\n" +
                "- Bác sĩ: %s\n" +
                "- Chuyên khoa: %s\n" +
                "- Phòng khám: %s\n" +
                "- Thời gian: %s\n" +
                "- Lý do khám: %s\n" +
                "- Số tiền đặt cọc: %,.0f VNĐ\n\n" +
                "Vui lòng có mặt đúng giờ. Nếu có thay đổi, vui lòng liên hệ trước ít nhất 24 giờ.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Hệ thống Đặt lịch Y tế",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getSpecialty().getName(),
                appointment.getClinic().getName(),
                appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getReasonForVisit(),
                appointment.getDepositAmount()
        );

        sendSimpleEmail(appointment.getPatient().getEmail(), subject, content);
    }

    @Override
    public void sendAppointmentReminderEmail(Appointment appointment) {
        if (appointment.getPatient().getEmail() == null || appointment.getPatient().getEmail().isEmpty()) {
            return;
        }

        String subject = "Nhắc nhở lịch hẹn - Hệ thống Y tế";
        String content = String.format(
                "Xin chào %s,\n\n" +
                "Đây là email nhắc nhở về lịch hẹn của bạn:\n" +
                "- Bác sĩ: %s\n" +
                "- Chuyên khoa: %s\n" +
                "- Phòng khám: %s\n" +
                "- Thời gian: %s\n\n" +
                "Vui lòng có mặt đúng giờ.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Hệ thống Đặt lịch Y tế",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getSpecialty().getName(),
                appointment.getClinic().getName(),
                appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        );

        sendSimpleEmail(appointment.getPatient().getEmail(), subject, content);
    }

    @Override
    public void sendAppointmentCancellationEmail(Appointment appointment, String reason) {
        if (appointment.getPatient().getEmail() == null || appointment.getPatient().getEmail().isEmpty()) {
            return;
        }

        String subject = "Thông báo hủy lịch hẹn - Hệ thống Y tế";
        String content = String.format(
                "Xin chào %s,\n\n" +
                "Lịch hẹn của bạn đã bị hủy với thông tin sau:\n" +
                "- Bác sĩ: %s\n" +
                "- Chuyên khoa: %s\n" +
                "- Phòng khám: %s\n" +
                "- Thời gian: %s\n" +
                "- Lý do hủy: %s\n\n" +
                "Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng liên hệ để đặt lịch mới.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Hệ thống Đặt lịch Y tế",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getSpecialty().getName(),
                appointment.getClinic().getName(),
                appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                reason != null ? reason : "Không có lý do cụ thể"
        );

        sendSimpleEmail(appointment.getPatient().getEmail(), subject, content);
    }

    @Override
    public void sendAppointmentUpdateEmail(Appointment appointment) {
        if (appointment.getPatient().getEmail() == null || appointment.getPatient().getEmail().isEmpty()) {
            return;
        }

        String subject = "Thông báo thay đổi lịch hẹn - Hệ thống Y tế";
        String content = String.format(
                "Xin chào %s,\n\n" +
                "Lịch hẹn của bạn đã được cập nhật với thông tin mới:\n" +
                "- Bác sĩ: %s\n" +
                "- Chuyên khoa: %s\n" +
                "- Phòng khám: %s\n" +
                "- Thời gian: %s\n" +
                "- Lý do khám: %s\n\n" +
                "Vui lòng có mặt đúng giờ theo lịch mới.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ Hệ thống Đặt lịch Y tế",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getSpecialty().getName(),
                appointment.getClinic().getName(),
                appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getReasonForVisit()
        );

        sendSimpleEmail(appointment.getPatient().getEmail(), subject, content);
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email đã được gửi thành công đến: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email đến {}: {}", to, e.getMessage());
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom(fromEmail);

            mailSender.send(mimeMessage);
            log.info("HTML Email đã được gửi thành công đến: {}", to);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi HTML email đến {}: {}", to, e.getMessage());
        }
    }
} 
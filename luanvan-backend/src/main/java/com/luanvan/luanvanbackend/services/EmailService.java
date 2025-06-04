package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.User;

public interface EmailService {
    /**
     * Gửi email chào mừng khi người dùng đặt lịch lần đầu tiên (qua Clerk)
     */
    void sendWelcomeOnFirstAppointmentEmail(User user);
    
    /**
     * Gửi email xác nhận đặt lịch hẹn
     */
    void sendAppointmentConfirmationEmail(Appointment appointment);
    
    /**
     * Gửi email nhắc nhở lịch hẹn
     */
    void sendAppointmentReminderEmail(Appointment appointment);
    
    /**
     * Gửi email thông báo hủy lịch hẹn
     */
    void sendAppointmentCancellationEmail(Appointment appointment, String reason);
    
    /**
     * Gửi email thông báo thay đổi lịch hẹn
     */
    void sendAppointmentUpdateEmail(Appointment appointment);
    
    /**
     * Gửi email đơn giản
     */
    void sendSimpleEmail(String to, String subject, String content);
    
    /**
     * Gửi email HTML
     */
    void sendHtmlEmail(String to, String subject, String htmlContent);
} 
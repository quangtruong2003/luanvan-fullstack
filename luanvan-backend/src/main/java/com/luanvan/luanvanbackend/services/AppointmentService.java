package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.dto.AppointmentStatusUpdateDTO;
import com.luanvan.luanvanbackend.entities.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentService {
    
    /**
     * Lấy danh sách tất cả lịch hẹn (có phân trang)
     * @param pageable Thông tin phân trang
     * @return Danh sách lịch hẹn có phân trang
     */
    Page<Appointment> getAllAppointments(Pageable pageable);
    
    /**
     * Lấy thông tin lịch hẹn theo ID
     * @param appointmentId ID của lịch hẹn
     * @return Thông tin lịch hẹn
     */
    Appointment getAppointmentById(Long appointmentId);
    
    /**
     * Lấy danh sách lịch hẹn theo bệnh nhân
     * @param patientId ID của bệnh nhân
     * @return Danh sách lịch hẹn
     */
    List<Appointment> getAppointmentsByPatient(Long patientId);
    
    /**
     * Lấy danh sách lịch hẹn theo bệnh nhân có phân trang
     * @param patientId ID của bệnh nhân
     * @param pageable Thông tin phân trang
     * @return Danh sách lịch hẹn có phân trang
     */
    Page<Appointment> getAppointmentsByPatient(Long patientId, Pageable pageable);
    
    /**
     * Lấy danh sách lịch hẹn theo bác sĩ
     * @param doctorId ID của bác sĩ
     * @return Danh sách lịch hẹn
     */
    List<Appointment> getAppointmentsByDoctor(Long doctorId);
    
    /**
     * Lấy danh sách lịch hẹn theo bác sĩ có phân trang
     * @param doctorId ID của bác sĩ
     * @param pageable Thông tin phân trang
     * @return Danh sách lịch hẹn có phân trang
     */
    Page<Appointment> getAppointmentsByDoctor(Long doctorId, Pageable pageable);
    
    /**
     * Lấy danh sách lịch hẹn theo trạng thái
     * @param status Trạng thái lịch hẹn
     * @return Danh sách lịch hẹn
     */
    List<Appointment> getAppointmentsByStatus(String status);
    
    /**
     * Lấy danh sách lịch hẹn theo phòng khám
     * @param clinicId ID của phòng khám
     * @return Danh sách lịch hẹn
     */
    List<Appointment> getAppointmentsByClinic(Long clinicId);
    
    /**
     * Lấy danh sách lịch hẹn theo ngày
     * @param date Ngày cần tìm
     * @return Danh sách lịch hẹn
     */
    List<Appointment> getAppointmentsByDate(LocalDate date);
    
    /**
     * Tạo lịch hẹn mới
     * @param appointmentDTO Thông tin lịch hẹn
     * @return Lịch hẹn đã được tạo
     */
    Appointment createAppointment(AppointmentDTO appointmentDTO);
    
    /**
     * Cập nhật thông tin lịch hẹn
     * @param appointmentId ID của lịch hẹn
     * @param appointmentDTO Thông tin cập nhật
     * @return Lịch hẹn sau khi cập nhật
     */
    Appointment updateAppointment(Long appointmentId, AppointmentDTO appointmentDTO);
    
    /**
     * Cập nhật trạng thái lịch hẹn
     * @param appointmentId ID của lịch hẹn
     * @param statusUpdateDTO Thông tin cập nhật trạng thái
     * @return Lịch hẹn sau khi cập nhật
     */
    Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateDTO statusUpdateDTO);
    
    /**
     * Hủy lịch hẹn (bởi bệnh nhân)
     * @param appointmentId ID của lịch hẹn
     * @param cancellationReason Lý do hủy
     * @return true nếu hủy thành công
     */
    boolean cancelAppointmentByPatient(Long appointmentId, String cancellationReason);
    
    /**
     * Hủy lịch hẹn (bởi phòng khám)
     * @param appointmentId ID của lịch hẹn
     * @param cancellationReason Lý do hủy
     * @return true nếu hủy thành công
     */
    boolean cancelAppointmentByClinic(Long appointmentId, String cancellationReason);
    
    /**
     * Xác nhận lịch hẹn (sau khi thanh toán thành công)
     * @param appointmentId ID của lịch hẹn
     * @param paymentTransactionId ID giao dịch thanh toán
     * @return Lịch hẹn sau khi xác nhận
     */
    Appointment confirmAppointment(Long appointmentId, String paymentTransactionId);
    
    /**
     * Đánh dấu lịch hẹn đã hoàn thành
     * @param appointmentId ID của lịch hẹn
     * @return Lịch hẹn sau khi cập nhật
     */
    Appointment completeAppointment(Long appointmentId);
    
    /**
     * Lấy danh sách lịch hẹn sắp tới cần gửi nhắc nhở
     * @param reminderThreshold Thời gian trước khi nhắc nhở (giờ)
     * @return Danh sách lịch hẹn cần nhắc nhở
     */
    List<Appointment> getUpcomingAppointmentsForReminder(int reminderThreshold);
    
    /**
     * Cập nhật trạng thái thanh toán
     * @param appointmentId ID của lịch hẹn
     * @param paymentStatus Trạng thái thanh toán mới
     * @param transactionId ID giao dịch (nếu có)
     * @return Lịch hẹn sau khi cập nhật
     */
    Appointment updatePaymentStatus(Long appointmentId, String paymentStatus, String transactionId);
} 
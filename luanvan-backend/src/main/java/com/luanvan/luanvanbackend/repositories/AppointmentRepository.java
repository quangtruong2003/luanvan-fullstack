package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Tìm lịch hẹn theo bệnh nhân
    List<Appointment> findByPatientUserId(Long patientId);
    Page<Appointment> findByPatientUserId(Long patientId, Pageable pageable);
    
    // Tìm lịch hẹn theo bác sĩ
    List<Appointment> findByDoctorUserId(Long doctorId);
    Page<Appointment> findByDoctorUserId(Long doctorId, Pageable pageable);
    
    // Tìm lịch hẹn theo trạng thái
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    
    // Tìm lịch hẹn theo phòng khám
    List<Appointment> findByClinicClinicId(Long clinicId);
    
    // Tìm lịch hẹn theo slot
    Appointment findBySlotSlotId(Long slotId);
    
    // Tìm lịch hẹn theo thời gian
    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);
    
    // Tìm lịch hẹn theo bác sĩ và trạng thái
    List<Appointment> findByDoctorUserIdAndStatus(Long doctorId, Appointment.AppointmentStatus status);
    
    // Tìm lịch hẹn theo bệnh nhân và trạng thái
    List<Appointment> findByPatientUserIdAndStatus(Long patientId, Appointment.AppointmentStatus status);
    
    // Truy vấn nâng cao: Tìm lịch hẹn theo bác sĩ và khoảng thời gian
    @Query("SELECT a FROM Appointment a WHERE a.doctor.userId = :doctorId AND a.appointmentDateTime BETWEEN :startDate AND :endDate")
    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId, 
                                                @Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    // Đếm số lịch hẹn theo trạng thái cho một phòng khám
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.clinic.clinicId = :clinicId AND a.status = :status")
    Long countByClinicIdAndStatus(@Param("clinicId") Long clinicId, @Param("status") Appointment.AppointmentStatus status);
    
    // Kiểm tra trạng thái thanh toán
    List<Appointment> findByIsDepositPaid(boolean isDepositPaid);
    
    // Lấy danh sách lịch hẹn sắp tới để gửi thông báo nhắc nhở
    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' AND a.appointmentDateTime BETWEEN :startTime AND :endTime")
    List<Appointment> findUpcomingAppointmentsForReminder(@Param("startTime") LocalDateTime startTime, 
                                                         @Param("endTime") LocalDateTime endTime);

    long countByDoctorUserIdAndStatusIn(Long doctorId, List<Appointment.AppointmentStatus> statuses);
} 
package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Optimized queries with EntityGraph to prevent N+1 problems
    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.patient.userId = :patientId ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByPatientUserIdWithDetails(@Param("patientId") Long patientId);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.patient.userId = :patientId ORDER BY a.appointmentDateTime DESC")
    Page<Appointment> findByPatientUserIdWithDetails(@Param("patientId") Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.doctor.userId = :doctorId ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByDoctorUserIdWithDetails(@Param("doctorId") Long doctorId);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.doctor.userId = :doctorId ORDER BY a.appointmentDateTime DESC")
    Page<Appointment> findByDoctorUserIdWithDetails(@Param("doctorId") Long doctorId, Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.clinic.clinicId = :clinicId ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByClinicIdWithDetails(@Param("clinicId") Long clinicId);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.status = :status ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByStatusWithDetails(@Param("status") Appointment.AppointmentStatus status);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime BETWEEN :startDateTime AND :endDateTime ORDER BY a.appointmentDateTime")
    List<Appointment> findByAppointmentDateTimeBetweenWithDetails(
            @Param("startDateTime") LocalDateTime startDateTime, 
            @Param("endDateTime") LocalDateTime endDateTime);

    @EntityGraph(attributePaths = {"patient", "doctor", "clinic", "specialty", "slot"})
    @Query("SELECT a FROM Appointment a WHERE a.appointmentId = :appointmentId")
    Optional<Appointment> findByIdWithDetails(@Param("appointmentId") Long appointmentId);

    // Original methods - keep for backward compatibility but prefer WithDetails versions
    List<Appointment> findByPatientUserId(Long patientId);
    Page<Appointment> findByPatientUserId(Long patientId, Pageable pageable);
    List<Appointment> findByDoctorUserId(Long doctorId);
    Page<Appointment> findByDoctorUserId(Long doctorId, Pageable pageable);
    List<Appointment> findByClinicClinicId(Long clinicId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    // Advanced optimized queries
    @Query("""
        SELECT a FROM Appointment a 
        JOIN FETCH a.patient p 
        JOIN FETCH a.doctor d 
        JOIN FETCH a.clinic c 
        JOIN FETCH a.specialty s 
        JOIN FETCH a.slot sl 
        WHERE a.status IN :statuses 
        AND a.appointmentDateTime BETWEEN :startDate AND :endDate 
        ORDER BY a.appointmentDateTime ASC
        """)
    List<Appointment> findUpcomingAppointmentsForReminder(
            @Param("statuses") List<Appointment.AppointmentStatus> statuses,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT COUNT(a) FROM Appointment a 
        WHERE a.doctor.userId = :doctorId 
        AND a.appointmentDateTime BETWEEN :startOfDay AND :endOfDay 
        AND a.status NOT IN ('CANCELLED_BY_PATIENT', 'CANCELLED_BY_CLINIC')
        """)
    Long countDoctorAppointmentsForDay(
            @Param("doctorId") Long doctorId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("""
        SELECT a FROM Appointment a 
        JOIN FETCH a.patient p 
        JOIN FETCH a.doctor d 
        JOIN FETCH a.clinic c 
        WHERE a.clinic.clinicId = :clinicId 
        AND DATE(a.appointmentDateTime) = :appointmentDate 
        AND a.status NOT IN ('CANCELLED_BY_PATIENT', 'CANCELLED_BY_CLINIC')
        ORDER BY a.appointmentDateTime ASC
        """)
    List<Appointment> findClinicAppointmentsByDate(
            @Param("clinicId") Long clinicId,
            @Param("appointmentDate") LocalDate appointmentDate);

    @Query("""
        SELECT a FROM Appointment a 
        JOIN FETCH a.patient p 
        WHERE p.email = :email 
        AND a.status = 'CONFIRMED' 
        AND a.appointmentDateTime > CURRENT_TIMESTAMP 
        ORDER BY a.appointmentDateTime ASC
        """)
    List<Appointment> findUpcomingConfirmedAppointmentsByEmail(@Param("email") String email);

    // Dashboard and analytics queries
    @Query("""
        SELECT COUNT(a) FROM Appointment a 
        WHERE a.clinic.clinicId = :clinicId 
        AND a.appointmentDateTime BETWEEN :startDate AND :endDate 
        AND a.status = :status
        """)
    Long countAppointmentsByClinicAndStatusAndDateRange(
            @Param("clinicId") Long clinicId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") Appointment.AppointmentStatus status);

    @Query("""
        SELECT a.status, COUNT(a) FROM Appointment a 
        WHERE a.clinic.clinicId = :clinicId 
        AND a.appointmentDateTime BETWEEN :startDate AND :endDate 
        GROUP BY a.status
        """)
    List<Object[]> getAppointmentStatusStatsByClinic(
            @Param("clinicId") Long clinicId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Performance optimized batch operations
    @Query("SELECT a.appointmentId FROM Appointment a WHERE a.status = :status AND a.appointmentDateTime < :cutoffTime")
    List<Long> findAppointmentIdsForBatchUpdate(
            @Param("status") Appointment.AppointmentStatus status,
            @Param("cutoffTime") LocalDateTime cutoffTime);

    // Conflict detection queries
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a 
        WHERE a.doctor.userId = :doctorId 
        AND a.appointmentDateTime = :appointmentDateTime 
        AND a.status NOT IN ('CANCELLED_BY_PATIENT', 'CANCELLED_BY_CLINIC', 'PAYMENT_FAILED')
        AND (:excludeId IS NULL OR a.appointmentId != :excludeId)
        """)
    boolean existsConflictingAppointment(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDateTime") LocalDateTime appointmentDateTime,
            @Param("excludeId") Long excludeId);

    // Additional method for doctor statistics
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.userId = :doctorId AND a.status IN :statuses")
    Long countByDoctorUserIdAndStatusIn(
            @Param("doctorId") Long doctorId,
            @Param("statuses") List<Appointment.AppointmentStatus> statuses);
            
    // Overloaded method for backward compatibility with AppointmentServiceImpl
    @Query("""
        SELECT a FROM Appointment a 
        JOIN FETCH a.patient p 
        JOIN FETCH a.doctor d 
        JOIN FETCH a.clinic c 
        WHERE a.status IN ('CONFIRMED', 'PENDING') 
        AND a.appointmentDateTime BETWEEN :startDate AND :endDate 
        ORDER BY a.appointmentDateTime ASC
        """)
    List<Appointment> findUpcomingAppointmentsForReminder(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<Appointment> findByStatusAndAppointmentDateTimeBefore(Appointment.AppointmentStatus status, LocalDateTime dateTime);
} 
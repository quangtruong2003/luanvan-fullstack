package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.dto.AppointmentStatusUpdateDTO;
import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.services.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Lấy danh sách tất cả lịch hẹn (chỉ Admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Appointment>> getAllAppointments(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Lấy thông tin lịch hẹn theo ID (Admin, bác sĩ hoặc bệnh nhân của lịch hẹn đó)
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasRole('ADMIN') or " +
                  "@appointmentService.getAppointmentById(#appointmentId).patient.userId == authentication.principal.userId or " +
                  "@appointmentService.getAppointmentById(#appointmentId).doctor.userId == authentication.principal.userId")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Lấy danh sách lịch hẹn của bệnh nhân (chính bệnh nhân đó hoặc Admin)
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or #patientId == authentication.principal.userId")
    public ResponseEntity<Page<Appointment>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId, pageable);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Lấy danh sách lịch hẹn của bác sĩ (chính bác sĩ đó hoặc Admin)
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or " +
                  "@doctorService.getDoctorByUserId(authentication.principal.userId).doctorId == #doctorId")
    public ResponseEntity<Page<Appointment>> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Lấy danh sách lịch hẹn theo trạng thái (chỉ Admin)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Lấy danh sách lịch hẹn theo phòng khám (chỉ Admin)
     */
    @GetMapping("/clinic/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAppointmentsByClinic(@PathVariable Long clinicId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByClinic(clinicId);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Lấy danh sách lịch hẹn theo ngày (chỉ Admin)
     */
    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Tạo lịch hẹn mới (Patient hoặc Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentService.createAppointment(appointmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    /**
     * Cập nhật thông tin lịch hẹn (chỉ Admin)
     */
    @PutMapping("/{appointmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentService.updateAppointment(appointmentId, appointmentDTO);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Cập nhật trạng thái lịch hẹn (chỉ Admin)
     */
    @PutMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateDTO statusUpdateDTO) {
        Appointment appointment = appointmentService.updateAppointmentStatus(appointmentId, statusUpdateDTO);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Hủy lịch hẹn bởi bệnh nhân (chỉ bệnh nhân đó)
     */
    @PutMapping("/{appointmentId}/cancel-by-patient")
    @PreAuthorize("@appointmentService.getAppointmentById(#appointmentId).patient.userId == authentication.principal.userId")
    public ResponseEntity<String> cancelAppointmentByPatient(
            @PathVariable Long appointmentId,
            @RequestParam String cancellationReason) {
        boolean success = appointmentService.cancelAppointmentByPatient(appointmentId, cancellationReason);
        if (success) {
            return ResponseEntity.ok("Đã hủy lịch hẹn thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể hủy lịch hẹn");
        }
    }

    /**
     * Hủy lịch hẹn bởi phòng khám (chỉ Admin)
     */
    @PutMapping("/{appointmentId}/cancel-by-clinic")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> cancelAppointmentByClinic(
            @PathVariable Long appointmentId,
            @RequestParam String cancellationReason) {
        boolean success = appointmentService.cancelAppointmentByClinic(appointmentId, cancellationReason);
        if (success) {
            return ResponseEntity.ok("Đã hủy lịch hẹn thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể hủy lịch hẹn");
        }
    }

    /**
     * Xác nhận lịch hẹn sau thanh toán (chỉ Admin hoặc hệ thống)
     */
    @PutMapping("/{appointmentId}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> confirmAppointment(
            @PathVariable Long appointmentId,
            @RequestParam String paymentTransactionId) {
        Appointment appointment = appointmentService.confirmAppointment(appointmentId, paymentTransactionId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Đánh dấu lịch hẹn hoàn thành (chỉ Admin)
     */
    @PutMapping("/{appointmentId}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentService.completeAppointment(appointmentId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Cập nhật trạng thái thanh toán (chỉ Admin hoặc webhook)
     */
    @PutMapping("/{appointmentId}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Appointment> updatePaymentStatus(
            @PathVariable Long appointmentId,
            @RequestParam String paymentStatus,
            @RequestParam(required = false) String transactionId) {
        Appointment appointment = appointmentService.updatePaymentStatus(appointmentId, paymentStatus, transactionId);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Lấy danh sách lịch hẹn sắp tới cần nhắc nhở (chỉ Admin)
     */
    @GetMapping("/upcoming-reminders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getUpcomingAppointmentsForReminder(
            @RequestParam(defaultValue = "24") int reminderThreshold) {
        List<Appointment> appointments = appointmentService.getUpcomingAppointmentsForReminder(reminderThreshold);
        return ResponseEntity.ok(appointments);
    }
} 
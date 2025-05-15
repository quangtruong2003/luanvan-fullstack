package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.dto.AppointmentStatusUpdateDTO;
import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.AvailabilitySlotRepository;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AvailabilitySlotRepository slotRepository;
    
    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public Appointment getAppointmentById(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
    }

    @Override
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        // Kiểm tra bệnh nhân có tồn tại hay không
        if (!userRepository.existsById(patientId)) {
            throw new RuntimeException("Không tìm thấy bệnh nhân với ID: " + patientId);
        }
        
        return appointmentRepository.findByPatientUserId(patientId);
    }

    @Override
    public Page<Appointment> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        // Kiểm tra bệnh nhân có tồn tại hay không
        if (!userRepository.existsById(patientId)) {
            throw new RuntimeException("Không tìm thấy bệnh nhân với ID: " + patientId);
        }
        
        return appointmentRepository.findByPatientUserId(patientId, pageable);
    }

    @Override
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        // Kiểm tra bác sĩ có tồn tại hay không
        if (!userRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return appointmentRepository.findByDoctorUserId(doctorId);
    }

    @Override
    public Page<Appointment> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        // Kiểm tra bác sĩ có tồn tại hay không
        if (!userRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return appointmentRepository.findByDoctorUserId(doctorId, pageable);
    }

    @Override
    public List<Appointment> getAppointmentsByStatus(String status) {
        try {
            Appointment.AppointmentStatus appointmentStatus = 
                    Appointment.AppointmentStatus.valueOf(status.toUpperCase());
            return appointmentRepository.findByStatus(appointmentStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    @Override
    public List<Appointment> getAppointmentsByClinic(Long clinicId) {
        // Kiểm tra phòng khám có tồn tại hay không
        if (!clinicRepository.existsById(clinicId)) {
            throw new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return appointmentRepository.findByClinicClinicId(clinicId);
    }

    @Override
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        // Tạo khoảng thời gian cho ngày cần tìm (từ 00:00 đến 23:59:59)
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        
        return appointmentRepository.findByAppointmentDateTimeBetween(startOfDay, endOfDay);
    }

    @Override
    @Transactional
    public Appointment createAppointment(AppointmentDTO appointmentDTO) {
        // Kiểm tra bệnh nhân
        User patient = userRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân với ID: " + appointmentDTO.getPatientId()));
        
        // Kiểm tra bác sĩ
        User doctor = userRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + appointmentDTO.getDoctorId()));
        
        // Kiểm tra slot
        AvailabilitySlot slot = slotRepository.findById(appointmentDTO.getSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ với ID: " + appointmentDTO.getSlotId()));
        
        // Kiểm tra slot có khả dụng không
        if (slot.getStatus() != AvailabilitySlot.SlotStatus.AVAILABLE) {
            throw new RuntimeException("Khung giờ đã được đặt hoặc không khả dụng");
        }
        
        // Kiểm tra chuyên khoa
        Specialty specialty = specialtyRepository.findById(appointmentDTO.getSpecialtyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + appointmentDTO.getSpecialtyId()));
        
        // Kiểm tra phòng khám
        Clinic clinic = clinicRepository.findById(appointmentDTO.getClinicId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + appointmentDTO.getClinicId()));
        
        // Tạo lịch hẹn mới
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setSpecialty(specialty);
        appointment.setClinic(clinic);
        appointment.setAppointmentDateTime(appointmentDTO.getAppointmentDateTime());
        appointment.setReasonForVisit(appointmentDTO.getReasonForVisit());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING_PAYMENT);
        appointment.setBookingTimestamp(LocalDateTime.now());
        appointment.setDepositAmount(appointmentDTO.getDepositAmount());
        
        // Kiểm tra thanh toán đặt cọc
        if (appointmentDTO.getIsDepositPaid() != null && appointmentDTO.getIsDepositPaid()) {
            appointment.setDepositPaid(true);
            appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            // Nếu muốn cập nhật trạng thái thanh toán Momo, thêm tại đây
        } else {
            appointment.setDepositPaid(false);
        }
        
        // Cập nhật trạng thái slot
        slot.setStatus(AvailabilitySlot.SlotStatus.BOOKED);
        slotRepository.save(slot);
        
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public Appointment updateAppointment(Long appointmentId, AppointmentDTO appointmentDTO) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        // Không cho phép cập nhật nếu lịch hẹn đã hoàn thành hoặc đã hủy
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED || 
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT ||
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC) {
            throw new RuntimeException("Không thể cập nhật lịch hẹn đã hoàn thành hoặc đã hủy");
        }
        
        // Cập nhật thông tin cơ bản
        if (appointmentDTO.getReasonForVisit() != null) {
            appointment.setReasonForVisit(appointmentDTO.getReasonForVisit());
        }
        
        // Cập nhật thời gian nếu cần
        if (appointmentDTO.getAppointmentDateTime() != null) {
            appointment.setAppointmentDateTime(appointmentDTO.getAppointmentDateTime());
        }
        
        // Nếu cập nhật slot, cần xử lý cẩn thận
        if (appointmentDTO.getSlotId() != null && !appointmentDTO.getSlotId().equals(appointment.getSlot().getSlotId())) {
            // Lấy slot mới
            AvailabilitySlot newSlot = slotRepository.findById(appointmentDTO.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ với ID: " + appointmentDTO.getSlotId()));
            
            // Kiểm tra slot mới có khả dụng không
            if (newSlot.getStatus() != AvailabilitySlot.SlotStatus.AVAILABLE) {
                throw new RuntimeException("Khung giờ mới đã được đặt hoặc không khả dụng");
            }
            
            // Cập nhật trạng thái slot cũ và mới
            AvailabilitySlot oldSlot = appointment.getSlot();
            oldSlot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
            newSlot.setStatus(AvailabilitySlot.SlotStatus.BOOKED);
            
            slotRepository.save(oldSlot);
            slotRepository.save(newSlot);
            
            appointment.setSlot(newSlot);
        }
        
        // Cập nhật chuyên khoa nếu cần
        if (appointmentDTO.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(appointmentDTO.getSpecialtyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + appointmentDTO.getSpecialtyId()));
            appointment.setSpecialty(specialty);
        }
        
        // Cập nhật phòng khám nếu cần
        if (appointmentDTO.getClinicId() != null) {
            Clinic clinic = clinicRepository.findById(appointmentDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + appointmentDTO.getClinicId()));
            appointment.setClinic(clinic);
        }
        
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateDTO statusUpdateDTO) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        try {
            Appointment.AppointmentStatus newStatus = 
                    Appointment.AppointmentStatus.valueOf(statusUpdateDTO.getStatus().toUpperCase());
            
            // Kiểm tra logic chuyển trạng thái
            validateStatusTransition(appointment.getStatus(), newStatus);
            
            appointment.setStatus(newStatus);
            
            // Xử lý trường hợp hủy lịch
            if (newStatus == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT || 
                    newStatus == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC) {
                appointment.setCancellationTimestamp(LocalDateTime.now());
                appointment.setCancellationReason(statusUpdateDTO.getCancellationReason());
                
                // Cập nhật trạng thái slot
                AvailabilitySlot slot = appointment.getSlot();
                slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
                slotRepository.save(slot);
            }
            
            return appointmentRepository.save(appointment);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + statusUpdateDTO.getStatus());
        }
    }

    @Override
    @Transactional
    public boolean cancelAppointmentByPatient(Long appointmentId, String cancellationReason) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        // Kiểm tra xem có thể hủy không
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED || 
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT ||
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC) {
            throw new RuntimeException("Không thể hủy lịch hẹn đã hoàn thành hoặc đã hủy");
        }
        
        // Kiểm tra thời gian trước khi hủy (nếu cần)
        // TODO: Thêm logic kiểm tra thời gian cho phép hủy
        
        // Cập nhật trạng thái
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_PATIENT);
        appointment.setCancellationTimestamp(LocalDateTime.now());
        appointment.setCancellationReason(cancellationReason);
        
        // Xác định xem đặt cọc có được hoàn lại không dựa trên thời gian hủy
        // TODO: Lấy cấu hình từ SystemConfiguration
        int nonRefundableHours = 24; // Mặc định: 24 giờ trước lịch hẹn
        
        if (appointment.getAppointmentDateTime() != null) {
            long hoursBeforeAppointment = ChronoUnit.HOURS.between(
                    LocalDateTime.now(), appointment.getAppointmentDateTime());
            
            if (hoursBeforeAppointment < nonRefundableHours) {
                appointment.setDepositNonRefundable(true);
            }
        }
        
        // Cập nhật trạng thái slot
        AvailabilitySlot slot = appointment.getSlot();
        slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        
        appointmentRepository.save(appointment);
        
        return true;
    }

    @Override
    @Transactional
    public boolean cancelAppointmentByClinic(Long appointmentId, String cancellationReason) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        // Kiểm tra xem có thể hủy không
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED || 
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT ||
                appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC) {
            throw new RuntimeException("Không thể hủy lịch hẹn đã hoàn thành hoặc đã hủy");
        }
        
        // Cập nhật trạng thái
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_CLINIC);
        appointment.setCancellationTimestamp(LocalDateTime.now());
        appointment.setCancellationReason(cancellationReason);
        
        // Khi phòng khám hủy, đặt cọc luôn được hoàn lại
        appointment.setDepositNonRefundable(false);
        
        // Cập nhật trạng thái slot
        AvailabilitySlot slot = appointment.getSlot();
        slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        
        appointmentRepository.save(appointment);
        
        return true;
    }

    @Override
    @Transactional
    public Appointment confirmAppointment(Long appointmentId, String paymentTransactionId) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        // Chỉ có thể xác nhận nếu đang ở trạng thái chờ thanh toán
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Không thể xác nhận lịch hẹn không ở trạng thái chờ thanh toán");
        }
        
        // Cập nhật thông tin thanh toán
        appointment.setDepositPaid(true);
        appointment.setPaymentTransactionId(paymentTransactionId);
        appointment.setPaymentTimestamp(LocalDateTime.now());
        appointment.setPaymentStatusMomo(Appointment.PaymentStatus.SUCCESS);
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public Appointment completeAppointment(Long appointmentId) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        // Chỉ có thể hoàn thành nếu đã xác nhận
        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Không thể đánh dấu hoàn thành cho lịch hẹn chưa được xác nhận");
        }
        
        // Cập nhật trạng thái
        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getUpcomingAppointmentsForReminder(int reminderThreshold) {
        // Tính toán khoảng thời gian sắp tới để gửi nhắc nhở
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindow = now.plusHours(reminderThreshold);
        
        return appointmentRepository.findUpcomingAppointmentsForReminder(now, reminderWindow);
    }

    @Override
    @Transactional
    public Appointment updatePaymentStatus(Long appointmentId, String paymentStatus, String transactionId) {
        Appointment appointment = getAppointmentById(appointmentId);
        
        try {
            Appointment.PaymentStatus newPaymentStatus = 
                    Appointment.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            
            appointment.setPaymentStatusMomo(newPaymentStatus);
            
            if (transactionId != null) {
                appointment.setPaymentTransactionId(transactionId);
            }
            
            // Cập nhật trạng thái lịch hẹn dựa trên trạng thái thanh toán
            if (newPaymentStatus == Appointment.PaymentStatus.SUCCESS) {
                appointment.setDepositPaid(true);
                appointment.setPaymentTimestamp(LocalDateTime.now());
                appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            } else if (newPaymentStatus == Appointment.PaymentStatus.FAILED) {
                // Có thể giữ nguyên trạng thái PENDING_PAYMENT hoặc đánh dấu lỗi
                appointment.setStatus(Appointment.AppointmentStatus.PAYMENT_FAILED);
            }
            
            return appointmentRepository.save(appointment);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái thanh toán không hợp lệ: " + paymentStatus);
        }
    }
    
    // Helper method để kiểm tra logic chuyển trạng thái
    private void validateStatusTransition(Appointment.AppointmentStatus currentStatus, Appointment.AppointmentStatus newStatus) {
        // Kiểm tra logic chuyển trạng thái
        if ((currentStatus == Appointment.AppointmentStatus.COMPLETED && newStatus != Appointment.AppointmentStatus.COMPLETED) ||
                (currentStatus == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT && newStatus != Appointment.AppointmentStatus.CANCELLED_BY_PATIENT) ||
                (currentStatus == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC && newStatus != Appointment.AppointmentStatus.CANCELLED_BY_CLINIC)) {
            throw new RuntimeException("Không thể thay đổi trạng thái từ " + currentStatus + " sang " + newStatus);
        }
    }
} 
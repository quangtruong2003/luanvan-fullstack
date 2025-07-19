package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.entities.*;
import com.luanvan.luanvanbackend.exception.MissingContactInfoException;
import com.luanvan.luanvanbackend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentValidationService {

    private final UserRepository userRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ClinicRepository clinicRepository;
    private final UserService userService;

    public User validatePatient(Long patientId) {
        return userRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân với ID: " + patientId));
    }

    public User validateDoctor(Long doctorId) {
        return userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
    }

    public AvailabilitySlot validateAndCheckSlotAvailability(Long slotId) {
        AvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ với ID: " + slotId));
        
        if (slot.getStatus() != AvailabilitySlot.SlotStatus.AVAILABLE) {
            throw new RuntimeException("Khung giờ đã được đặt hoặc không khả dụng");
        }
        
        return slot;
    }

    // @Cacheable(value = "specialties", key = "#specialtyId") // Tạm thời tắt cache
    public Specialty validateSpecialty(Long specialtyId) {
        return specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId));
    }

    // @Cacheable(value = "clinics", key = "#clinicId") // Tạm thời tắt cache
    public Clinic validateClinic(Long clinicId) {
        return clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId));
    }

    public void validatePatientContactInfo(User patient) {
        if (!userService.hasRequiredContactInfo(patient.getUserId())) {
            List<String> missingInfo = userService.getMissingContactInfo(patient.getUserId());
            throw new MissingContactInfoException(
                "Bệnh nhân thiếu thông tin liên hệ cần thiết: " + String.join(", ", missingInfo)
            );
        }
    }

    public void validateAppointmentCreation(AppointmentDTO appointmentDTO) {
        // Validate all entities exist and are valid
        User patient = validatePatient(appointmentDTO.getPatientId());
        User doctor = validateDoctor(appointmentDTO.getDoctorId());
        AvailabilitySlot slot = validateAndCheckSlotAvailability(appointmentDTO.getSlotId());
        Specialty specialty = validateSpecialty(appointmentDTO.getSpecialtyId());
        Clinic clinic = validateClinic(appointmentDTO.getClinicId());

        // Validate patient contact info
        validatePatientContactInfo(patient);

        // Additional business validations
        validateDoctorSpecialtyCompatibility(doctor, specialty);
        validateSlotClinicCompatibility(slot, clinic);
    }

    private void validateDoctorSpecialtyCompatibility(User doctor, Specialty specialty) {
        // TODO: Add logic to check if doctor works with this specialty
        // This could be a query to DoctorSpecialty table
    }

    private void validateSlotClinicCompatibility(AvailabilitySlot slot, Clinic clinic) {
        if (!slot.getClinic().getClinicId().equals(clinic.getClinicId())) {
            throw new RuntimeException("Khung giờ không thuộc phòng khám được chọn");
        }
    }

    public void validateStatusTransition(Appointment.AppointmentStatus currentStatus, Appointment.AppointmentStatus newStatus) {
        // Define valid status transitions
        boolean isValidTransition = switch (currentStatus) {
            case PENDING_PAYMENT -> newStatus == Appointment.AppointmentStatus.CONFIRMED ||
                                   newStatus == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT ||
                                   newStatus == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC || // Allow admin to cancel
                                   newStatus == Appointment.AppointmentStatus.PAYMENT_FAILED;
            case CONFIRMED -> newStatus == Appointment.AppointmentStatus.COMPLETED ||
                             newStatus == Appointment.AppointmentStatus.CANCELLED_BY_PATIENT ||
                             newStatus == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC ||
                             newStatus == Appointment.AppointmentStatus.NO_SHOW; // Allow transition to NO_SHOW
            case PAYMENT_FAILED -> newStatus == Appointment.AppointmentStatus.PENDING_PAYMENT ||
                                   newStatus == Appointment.AppointmentStatus.CANCELLED_BY_CLINIC;
            case COMPLETED, CANCELLED_BY_PATIENT, CANCELLED_BY_CLINIC, NO_SHOW -> false; // Terminal states
        };

        if (!isValidTransition) {
            throw new RuntimeException(
                String.format("Không thể chuyển từ trạng thái %s sang %s", currentStatus, newStatus)
            );
        }
    }
} 
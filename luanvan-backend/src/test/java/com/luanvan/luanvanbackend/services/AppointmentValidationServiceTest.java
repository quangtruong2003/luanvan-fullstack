package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.entities.*;
import com.luanvan.luanvanbackend.exception.MissingContactInfoException;
import com.luanvan.luanvanbackend.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentValidationServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private AvailabilitySlotRepository slotRepository;
    
    @Mock
    private SpecialtyRepository specialtyRepository;
    
    @Mock
    private ClinicRepository clinicRepository;
    
    @Mock
    private UserService userService;

    @InjectMocks
    private AppointmentValidationService validationService;

    private User mockPatient;
    private User mockDoctor;
    private AvailabilitySlot mockSlot;
    private Specialty mockSpecialty;
    private Clinic mockClinic;
    private AppointmentDTO mockAppointmentDTO;

    @BeforeEach
    void setUp() {
        // Setup mock data
        mockPatient = createMockUser(1L, "patient@test.com", "Nguyen Van A");
        mockDoctor = createMockUser(2L, "doctor@test.com", "Bac Si B");
        
        mockClinic = new Clinic();
        mockClinic.setClinicId(1L);
        mockClinic.setName("Test Clinic");
        mockClinic.setAddress("123 Test Street");

        mockSpecialty = new Specialty();
        mockSpecialty.setSpecialtyId(1L);
        mockSpecialty.setName("Cardiology");

        mockSlot = new AvailabilitySlot();
        mockSlot.setSlotId(1L);
        mockSlot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
        mockSlot.setClinic(mockClinic);

        mockAppointmentDTO = createMockAppointmentDTO();
    }

    @Test
    void validatePatient_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockPatient));

        // When
        User result = validationService.validatePatient(1L);

        // Then
        assertNotNull(result);
        assertEquals(mockPatient.getUserId(), result.getUserId());
        verify(userRepository).findById(1L);
    }

    @Test
    void validatePatient_NotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> validationService.validatePatient(1L));
        
        assertEquals("Không tìm thấy bệnh nhân với ID: 1", exception.getMessage());
    }

    @Test
    void validateDoctor_Success() {
        // Given
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockDoctor));

        // When
        User result = validationService.validateDoctor(2L);

        // Then
        assertNotNull(result);
        assertEquals(mockDoctor.getUserId(), result.getUserId());
    }

    @Test
    void validateAndCheckSlotAvailability_Success() {
        // Given
        when(slotRepository.findById(1L)).thenReturn(Optional.of(mockSlot));

        // When
        AvailabilitySlot result = validationService.validateAndCheckSlotAvailability(1L);

        // Then
        assertNotNull(result);
        assertEquals(AvailabilitySlot.SlotStatus.AVAILABLE, result.getStatus());
    }

    @Test
    void validateAndCheckSlotAvailability_NotAvailable_ThrowsException() {
        // Given
        mockSlot.setStatus(AvailabilitySlot.SlotStatus.BOOKED);
        when(slotRepository.findById(1L)).thenReturn(Optional.of(mockSlot));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> validationService.validateAndCheckSlotAvailability(1L));
        
        assertEquals("Khung giờ đã được đặt hoặc không khả dụng", exception.getMessage());
    }

    @Test
    void validateSpecialty_Success() {
        // Given
        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(mockSpecialty));

        // When
        Specialty result = validationService.validateSpecialty(1L);

        // Then
        assertNotNull(result);
        assertEquals("Cardiology", result.getName());
    }

    @Test
    void validateClinic_Success() {
        // Given
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(mockClinic));

        // When
        Clinic result = validationService.validateClinic(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Clinic", result.getName());
    }

    @Test
    void validatePatientContactInfo_Success() {
        // Given
        when(userService.hasRequiredContactInfo(1L)).thenReturn(true);

        // When & Then
        assertDoesNotThrow(() -> validationService.validatePatientContactInfo(mockPatient));
        verify(userService).hasRequiredContactInfo(1L);
    }

    @Test
    void validatePatientContactInfo_Missing_ThrowsException() {
        // Given
        when(userService.hasRequiredContactInfo(1L)).thenReturn(false);
        when(userService.getMissingContactInfo(1L)).thenReturn(Arrays.asList("phoneNumber", "address"));

        // When & Then
        MissingContactInfoException exception = assertThrows(MissingContactInfoException.class,
            () -> validationService.validatePatientContactInfo(mockPatient));
        
        assertTrue(exception.getMessage().contains("phoneNumber, address"));
    }

    @Test
    void validateAppointmentCreation_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockPatient));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mockDoctor));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(mockSlot));
        when(specialtyRepository.findById(1L)).thenReturn(Optional.of(mockSpecialty));
        when(clinicRepository.findById(1L)).thenReturn(Optional.of(mockClinic));
        when(userService.hasRequiredContactInfo(1L)).thenReturn(true);

        // When & Then
        assertDoesNotThrow(() -> validationService.validateAppointmentCreation(mockAppointmentDTO));
    }

    @Test
    void validateStatusTransition_ValidTransition_Success() {
        // When & Then
        assertDoesNotThrow(() -> validationService.validateStatusTransition(
            Appointment.AppointmentStatus.PENDING_PAYMENT, 
            Appointment.AppointmentStatus.CONFIRMED));
    }

    @Test
    void validateStatusTransition_InvalidTransition_ThrowsException() {
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> validationService.validateStatusTransition(
                Appointment.AppointmentStatus.COMPLETED, 
                Appointment.AppointmentStatus.PENDING_PAYMENT));
        
        assertTrue(exception.getMessage().contains("Không thể chuyển từ trạng thái"));
    }

    @Test
    void validateStatusTransition_AllValidTransitions() {
        // Test all valid transitions
        assertDoesNotThrow(() -> {
            // From PENDING_PAYMENT
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.PENDING_PAYMENT, 
                Appointment.AppointmentStatus.CONFIRMED);
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.PENDING_PAYMENT, 
                Appointment.AppointmentStatus.CANCELLED_BY_PATIENT);
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.PENDING_PAYMENT, 
                Appointment.AppointmentStatus.PAYMENT_FAILED);

            // From CONFIRMED
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.CONFIRMED, 
                Appointment.AppointmentStatus.COMPLETED);
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.CONFIRMED, 
                Appointment.AppointmentStatus.CANCELLED_BY_PATIENT);
            validationService.validateStatusTransition(
                Appointment.AppointmentStatus.CONFIRMED, 
                Appointment.AppointmentStatus.CANCELLED_BY_CLINIC);
        });
    }

    // Helper methods
    private User createMockUser(Long id, String email, String fullName) {
        User user = new User();
        user.setUserId(id);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPhoneNumber("0123456789");
        user.setAddress("Test Address");
        return user;
    }

    private AppointmentDTO createMockAppointmentDTO() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setPatientId(1L);
        dto.setDoctorId(2L);
        dto.setSlotId(1L);
        dto.setSpecialtyId(1L);
        dto.setClinicId(1L);
        dto.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        dto.setReasonForVisit("Regular checkup");
        dto.setDepositAmount(new java.math.BigDecimal("100000.0"));
        dto.setIsDepositPaid(false);
        return dto;
    }
} 
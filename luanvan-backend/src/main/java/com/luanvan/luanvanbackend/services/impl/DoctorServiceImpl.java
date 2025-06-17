package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorResponseDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.*;
import com.luanvan.luanvanbackend.exception.ResourceNotFoundException;
import com.luanvan.luanvanbackend.repositories.*;
import com.luanvan.luanvanbackend.services.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("doctorService")
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private DoctorSpecialtyRepository doctorSpecialtyRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorResponseDTOById(Long doctorId) {
        Doctor doctor = getDoctorById(doctorId);
        return convertToResponseDTO(doctor);
    }

    @Override
    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for user id: " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorResponseDTOByUserId(Long userId) {
        Doctor doctor = getDoctorByUserId(userId);
        return convertToResponseDTO(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Page<Doctor> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable);
    }

    @Override
    public Page<Doctor> getDoctorsBySpecialty(Long specialtyId, Pageable pageable) {
        return doctorRepository.findBySpecialtyId(specialtyId, pageable);
    }

    @Override
    public Page<Doctor> searchDoctorsByName(String name, Pageable pageable) {
        return doctorRepository.findByUserFullNameContainingIgnoreCase(name, pageable);
    }

    @Override
    public Page<Doctor> getDoctorsByExperience(int yearsOfExperience, Pageable pageable) {
        return doctorRepository.findByYearsOfExperienceGreaterThanEqual(yearsOfExperience, pageable);
    }    @Override
    @Transactional
    public Doctor createDoctor(User user, DoctorDTO doctorDTO) {
        // Add debug logging
        System.out.println("DEBUG: Creating doctor with DoctorDTO:");
        System.out.println("  Bio: " + doctorDTO.getBio());
        System.out.println("  Years of Experience: " + doctorDTO.getYearsOfExperience());
        System.out.println("  Specialty IDs: " + doctorDTO.getSpecialtyIds());
        System.out.println("  Primary Specialty ID: " + doctorDTO.getPrimarySpecialtyId());
        
        // Check if doctor profile already exists by userId
        if (doctorRepository.findByUserUserId(user.getUserId()).isPresent()) {
            throw new IllegalStateException("Doctor profile already exists for this user.");
        }

        // Ensure the User entity is managed in the current session
        User managedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + user.getUserId()));

        // Create new Doctor entity
        Doctor doctor = new Doctor();
        doctor.setUser(managedUser); // @MapsId will automatically set doctorId = user.userId
        doctor.setBio(doctorDTO.getBio());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        
        System.out.println("DEBUG: About to save doctor with yearsOfExperience: " + doctor.getYearsOfExperience());
        
        // Save doctor (this will persist the new entity)
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        System.out.println("DEBUG: Saved doctor, ID: " + savedDoctor.getDoctorId() + ", yearsOfExperience: " + savedDoctor.getYearsOfExperience());
        
        // Assign specialties if provided
        if (doctorDTO.getSpecialtyIds() != null && !doctorDTO.getSpecialtyIds().isEmpty()) {
            System.out.println("DEBUG: Assigning specialties...");
            for (Long specialtyId : doctorDTO.getSpecialtyIds()) {
                boolean isPrimary = specialtyId.equals(doctorDTO.getPrimarySpecialtyId());
                System.out.println("DEBUG: Assigning specialty " + specialtyId + ", isPrimary: " + isPrimary);
                assignSpecialty(savedDoctor.getDoctorId(), specialtyId, isPrimary);
            }
        } else {
            System.out.println("DEBUG: No specialties to assign");
        }

        // Return the saved doctor with all relationships loaded
        return getDoctorById(savedDoctor.getDoctorId());
    }

    @Override
    @Transactional
    public DoctorResponseDTO createDoctorReturnDTO(User user, DoctorDTO doctorDTO) {
        Doctor doctor = createDoctor(user, doctorDTO);
        return convertToResponseDTO(doctor);
    }    @Override
    @Transactional
    public Doctor updateDoctor(Long doctorId, DoctorUpdateDTO doctorUpdateDTO) {
        System.out.println("DEBUG: Updating doctor with ID: " + doctorId);
        System.out.println("DEBUG: Update DTO - Specialty IDs: " + doctorUpdateDTO.getSpecialtyIds());
        
        Doctor doctor = getDoctorById(doctorId);

        if (doctorUpdateDTO.getBio() != null) {
            doctor.setBio(doctorUpdateDTO.getBio());
        }
        if (doctorUpdateDTO.getYearsOfExperience() != null) {
            doctor.setYearsOfExperience(doctorUpdateDTO.getYearsOfExperience());
        }        // Update specialties only if explicitly provided
        if (doctorUpdateDTO.getSpecialtyIds() != null) {
            System.out.println("DEBUG: Specialty IDs provided, updating...");
            if (!doctorUpdateDTO.getSpecialtyIds().isEmpty()) {
                // Clear existing specialties and add new ones
                List<DoctorSpecialty> existingSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctorId);
                doctorSpecialtyRepository.deleteAll(existingSpecialties);
                doctor.getSpecialties().clear(); // Clear the collection in the entity

                // Assign new specialties
                for (Long specialtyId : doctorUpdateDTO.getSpecialtyIds()) {
                    boolean isPrimary = specialtyId.equals(doctorUpdateDTO.getPrimarySpecialtyId());
                    assignSpecialty(doctor.getDoctorId(), specialtyId, isPrimary);
                }
            } else {
                // If an empty list is provided, remove all specialties
                List<DoctorSpecialty> existingSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctorId);
                doctorSpecialtyRepository.deleteAll(existingSpecialties);
                doctor.getSpecialties().clear(); // Clear the collection in the entity
            }        } else {
            System.out.println("DEBUG: No specialty IDs provided, keeping existing specialties");
        }
        // If specialtyIds is null, keep existing specialties unchanged
        
        Doctor updatedDoctor = doctorRepository.save(doctor);
        
        // Clear the persistence context and fetch fresh data to ensure all relationships are loaded
        doctorRepository.flush();
        
        System.out.println("DEBUG: Fetching fresh doctor data...");
        
        // It's crucial to return the entity that is managed by the current persistence context,
        // especially after modifying collections. Fetching it again ensures all changes are reflected.
        return getDoctorById(updatedDoctor.getDoctorId());
    }

    @Override
    @Transactional
    public DoctorResponseDTO updateDoctorReturnDTO(Long doctorId, DoctorUpdateDTO doctorUpdateDTO) {
        Doctor doctor = updateDoctor(doctorId, doctorUpdateDTO);
        return convertToResponseDTO(doctor);
    }

    @Override
    @Transactional
    public void deleteDoctor(Long doctorId) {
        Doctor doctor = getDoctorById(doctorId);

        long upcomingAppointments = appointmentRepository.countByDoctorUserIdAndStatusIn(
                doctor.getUser().getUserId(),
                List.of(Appointment.AppointmentStatus.PENDING_PAYMENT, Appointment.AppointmentStatus.CONFIRMED)
        );

        if (upcomingAppointments > 0) {
            throw new IllegalStateException("Không thể xóa bác sĩ vì vẫn còn " + upcomingAppointments + " lịch hẹn chưa hoàn thành.");
        }

        doctorSpecialtyRepository.deleteAll(doctorSpecialtyRepository.findByDoctorDoctorId(doctorId));

        doctorRepository.delete(doctor);
    }

    @Override
    @Transactional
    public void assignSpecialty(Long doctorId, Long specialtyId, boolean isPrimary) {
        Doctor doctor = getDoctorById(doctorId);
        Specialty specialty = specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + specialtyId));

        DoctorSpecialty existingLink = doctorSpecialtyRepository.findByDoctorDoctorIdAndSpecialtySpecialtyId(doctorId, specialtyId);

        if (existingLink != null && existingLink.isPrimary() == isPrimary) {
            return;
        }

        if (isPrimary) {
            doctorSpecialtyRepository.findByDoctorDoctorId(doctorId).forEach(ds -> {
                if (ds.isPrimary()) {
                    ds.setPrimary(false);
                    doctorSpecialtyRepository.save(ds);
                }
            });
        }

        if (existingLink != null) {
            existingLink.setPrimary(isPrimary);
            doctorSpecialtyRepository.save(existingLink);
        } else {
            DoctorSpecialty newLink = new DoctorSpecialty();
            newLink.setDoctor(doctor);
            newLink.setSpecialty(specialty);
            newLink.setPrimary(isPrimary);
            doctorSpecialtyRepository.save(newLink);
        }
    }

    @Override
    @Transactional
    public void removeSpecialty(Long doctorId, Long specialtyId) {
        if (!doctorRepository.existsById(doctorId) || !specialtyRepository.existsById(specialtyId)) {
            throw new ResourceNotFoundException("Doctor or Specialty not found.");
        }
        doctorSpecialtyRepository.deleteByDoctorDoctorIdAndSpecialtySpecialtyId(doctorId, specialtyId);
    }

    @Override
    public List<Object> getDoctorSpecialties(Long doctorId) {
        if (doctorId == null) {
            System.out.println("❌ [ERROR] Doctor ID is null in getDoctorSpecialties");
            return List.of();
        }
        
        try {
        List<DoctorSpecialty> doctorSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctorId);
            if (doctorSpecialties == null || doctorSpecialties.isEmpty()) {
                System.out.println("⚠️ [WARN] No specialties found for doctor ID: " + doctorId);
                return List.of();
            }
            
        return doctorSpecialties.stream()
                    .filter(ds -> ds != null && ds.getSpecialty() != null) // Filter out null entries
                    .map(ds -> {
                        try {
                            // Create a simple DTO structure to avoid circular reference
                            return new Object() {
                                public final Long specialtyId = ds.getSpecialty().getSpecialtyId();
                                public final String name = ds.getSpecialty().getName();
                                public final String description = ds.getSpecialty().getDescription();
                                public final boolean isPrimary = ds.isPrimary();
                                // Include clinic info if available
                                public final Object clinic = ds.getSpecialty().getClinic() != null ? new Object() {
                                    public final Long clinicId = ds.getSpecialty().getClinic().getClinicId();
                                    public final String name = ds.getSpecialty().getClinic().getName();
                                    public final String address = ds.getSpecialty().getClinic().getAddress();
                                } : null;
                            };
                        } catch (Exception e) {
                            System.err.println("❌ [ERROR] Error creating specialty DTO for ID " + ds.getSpecialty().getSpecialtyId() + ": " + e.getMessage());
                            return null; // This will be filtered out
                        }
                    })
                    .filter(specialty -> specialty != null) // Filter out null DTOs
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("❌ [ERROR] Error getting doctor specialties for doctor ID " + doctorId + ": " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Return empty list on error
        }
    }

    private DoctorResponseDTO convertToResponseDTO(Doctor doctor) {
        DoctorResponseDTO.UserDTO userDTO = new DoctorResponseDTO.UserDTO(
                doctor.getUser().getUserId(),
                doctor.getUser().getFullName(),
                doctor.getUser().getEmail(),
                doctor.getUser().getPhoneNumber(),
                doctor.getUser().getImageUrl()
        );

        // Always load specialties from repository to ensure fresh data
        List<DoctorSpecialty> doctorSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctor.getDoctorId());
        List<DoctorResponseDTO.SpecialtyResponseDTO> specialtyDTOs = doctorSpecialties.stream()
                .map(ds -> {
                    // Create clinic DTO if clinic exists
                    DoctorResponseDTO.ClinicDTO clinicDTO = null;
                    if (ds.getSpecialty().getClinic() != null) {
                                        clinicDTO = new DoctorResponseDTO.ClinicDTO(
                        ds.getSpecialty().getClinic().getClinicId(),
                        ds.getSpecialty().getClinic().getName(),
                        ds.getSpecialty().getClinic().getAddress(),
                        ds.getSpecialty().getClinic().getPhoneNumber(),
                        ds.getSpecialty().getClinic().getEmail()
                        );
                    }
                    
                    return new DoctorResponseDTO.SpecialtyResponseDTO(
                            ds.getSpecialty().getSpecialtyId(),
                            ds.getSpecialty().getName(),
                            ds.getSpecialty().getDescription(),
                            ds.isPrimary(),
                            clinicDTO
                    );
                })
                .collect(Collectors.toList());

        return new DoctorResponseDTO(
                doctor.getDoctorId(),
                userDTO,
                doctor.getBio(),
                doctor.getYearsOfExperience(),
                specialtyDTOs
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> getAllDoctorsDTO(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(this::convertToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> getDoctorsByExperienceDTO(int yearsOfExperience, Pageable pageable) {
        return doctorRepository.findByYearsOfExperienceGreaterThanEqual(yearsOfExperience, pageable).map(this::convertToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> getDoctorsBySpecialtyDTO(Long specialtyId, Pageable pageable) {
        return doctorRepository.findBySpecialtyId(specialtyId, pageable).map(this::convertToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDTO> searchDoctorsByNameDTO(String name, Pageable pageable) {
        return doctorRepository.findByUserFullNameContainingIgnoreCase(name, pageable).map(this::convertToResponseDTO);
    }
}
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

@Service
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
    public DoctorResponseDTO getDoctorResponseDTOById(Long doctorId) {
        Doctor doctor = getDoctorById(doctorId);
        return convertToResponseDTO(doctor);
    }

    @Override
    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for user id: " + userId));
    }

    @Override
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
    }

    @Override
    @Transactional
    public Doctor createDoctor(User user, DoctorDTO doctorDTO) {
        if (doctorRepository.existsById(user.getUserId())) {
            throw new IllegalStateException("Doctor profile already exists for this user.");
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setDoctorId(user.getUserId());
        doctor.setBio(doctorDTO.getBio());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());

        Doctor savedDoctor = doctorRepository.save(doctor);

        if (doctorDTO.getSpecialtyIds() != null && !doctorDTO.getSpecialtyIds().isEmpty()) {
            for (Long specialtyId : doctorDTO.getSpecialtyIds()) {
                boolean isPrimary = specialtyId.equals(doctorDTO.getPrimarySpecialtyId());
                assignSpecialty(savedDoctor.getDoctorId(), specialtyId, isPrimary);
            }
        }

        return getDoctorById(savedDoctor.getDoctorId());
    }

    @Override
    @Transactional
    public Doctor updateDoctor(Long doctorId, DoctorUpdateDTO doctorUpdateDTO) {
        Doctor doctor = getDoctorById(doctorId);

        if (doctorUpdateDTO.getBio() != null) {
            doctor.setBio(doctorUpdateDTO.getBio());
        }
        if (doctorUpdateDTO.getYearsOfExperience() != null) {
            doctor.setYearsOfExperience(doctorUpdateDTO.getYearsOfExperience());
        }

        return doctorRepository.save(doctor);
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
        List<DoctorSpecialty> doctorSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctorId);
        return doctorSpecialties.stream()
                .map(ds -> (Object) ds)
                .collect(Collectors.toList());
    }

    private DoctorResponseDTO convertToResponseDTO(Doctor doctor) {
        DoctorResponseDTO.UserDTO userDTO = new DoctorResponseDTO.UserDTO(
                doctor.getUser().getUserId(),
                doctor.getUser().getFullName(),
                doctor.getUser().getEmail(),
                doctor.getUser().getPhoneNumber(),
                doctor.getUser().getImageUrl()
        );

        List<DoctorResponseDTO.SpecialtyResponseDTO> specialtyDTOs = doctor.getSpecialties().stream()
                .map(ds -> new DoctorResponseDTO.SpecialtyResponseDTO(
                        ds.getSpecialty().getSpecialtyId(),
                        ds.getSpecialty().getName(),
                        ds.getSpecialty().getDescription(),
                        ds.isPrimary()
                ))
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
    public Page<DoctorResponseDTO> getAllDoctorsDTO(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(this::convertToResponseDTO);
    }

    @Override
    public Page<DoctorResponseDTO> getDoctorsByExperienceDTO(int yearsOfExperience, Pageable pageable) {
        return doctorRepository.findByYearsOfExperienceGreaterThanEqual(yearsOfExperience, pageable).map(this::convertToResponseDTO);
    }

    @Override
    public Page<DoctorResponseDTO> getDoctorsBySpecialtyDTO(Long specialtyId, Pageable pageable) {
        return doctorRepository.findBySpecialtyId(specialtyId, pageable).map(this::convertToResponseDTO);
    }

    @Override
    public Page<DoctorResponseDTO> searchDoctorsByNameDTO(String name, Pageable pageable) {
        return doctorRepository.findByUserFullNameContainingIgnoreCase(name, pageable).map(this::convertToResponseDTO);
    }
} 
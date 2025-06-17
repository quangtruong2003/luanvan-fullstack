package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.SpecialtyDTO;
import com.luanvan.luanvanbackend.dto.SpecialtyResponseDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.DoctorSpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.services.SpecialtyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecialtyServiceImpl implements SpecialtyService {

    @Autowired
    private SpecialtyRepository specialtyRepository;
    
    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private DoctorSpecialtyRepository doctorSpecialtyRepository;

    @Override
    public Specialty getSpecialtyById(Long specialtyId) {
        return specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId));
    }

    @Override
    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }

    @Override
    public Page<Specialty> getAllSpecialties(Pageable pageable) {
        return specialtyRepository.findAll(pageable);
    }

    @Override
    public List<Specialty> getSpecialtiesByClinic(Long clinicId) {
        // Kiểm tra phòng khám có tồn tại hay không
        if (!clinicRepository.existsById(clinicId)) {
            throw new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return specialtyRepository.findByClinicClinicId(clinicId);
    }

    @Override
    public Page<Specialty> searchSpecialtiesByName(String name, Pageable pageable) {
        return specialtyRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Override
    @Transactional
    public Specialty createSpecialty(SpecialtyDTO specialtyDTO) {
        // Kiểm tra phòng khám có tồn tại hay không
        Clinic clinic = null;
        if (specialtyDTO.getClinicId() != null) {
            clinic = clinicRepository.findById(specialtyDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + specialtyDTO.getClinicId()));
        }
        
        // Tạo chuyên khoa mới
        Specialty specialty = new Specialty();
        specialty.setName(specialtyDTO.getName());
        specialty.setDescription(specialtyDTO.getDescription());
        specialty.setClinic(clinic);
        
        return specialtyRepository.save(specialty);
    }

    @Override
    @Transactional
    public Specialty updateSpecialty(Long specialtyId, SpecialtyDTO specialtyDTO) {
        Specialty specialty = getSpecialtyById(specialtyId);
        
        // Cập nhật thông tin
        if (specialtyDTO.getName() != null) {
            specialty.setName(specialtyDTO.getName());
        }
        
        if (specialtyDTO.getDescription() != null) {
            specialty.setDescription(specialtyDTO.getDescription());
        }
        
        // Cập nhật phòng khám nếu có thay đổi
        if (specialtyDTO.getClinicId() != null) {
            Clinic clinic = clinicRepository.findById(specialtyDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + specialtyDTO.getClinicId()));
            specialty.setClinic(clinic);
        }
        
        return specialtyRepository.save(specialty);
    }

    @Override
    @Transactional
    public boolean deleteSpecialty(Long specialtyId) {
        Specialty specialty = getSpecialtyById(specialtyId);
        long doctorCount = doctorSpecialtyRepository.countBySpecialtySpecialtyId(specialtyId);
        if (doctorCount > 0) {
            throw new IllegalStateException("Không thể xóa chuyên khoa đang có bác sĩ phụ trách.");
        }
        specialtyRepository.delete(specialty);
        return true;
    }
    
    @Override
    public Page<SpecialtyResponseDTO> getAllSpecialtiesDTO(Pageable pageable) {
        Sort.Order sortByDoctorCount = pageable.getSort().getOrderFor("doctorCount");

        if (sortByDoctorCount != null) {
            // Sắp xếp theo doctorCount, các tiêu chí sắp xếp khác sẽ bị bỏ qua trong trường hợp này
            Pageable newPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            Page<Specialty> specialties;

            if (sortByDoctorCount.getDirection() == Sort.Direction.DESC) {
                specialties = specialtyRepository.findAllSortedByDoctorCountDesc(newPageable);
            } else {
                specialties = specialtyRepository.findAllSortedByDoctorCountAsc(newPageable);
            }
            return specialties.map(this::convertToResponseDTO);
        } else {
            // Sắp xếp mặc định theo các trường của entity
            Page<Specialty> specialties = specialtyRepository.findAll(pageable);
            return specialties.map(this::convertToResponseDTO);
        }
    }

    private SpecialtyResponseDTO convertToResponseDTO(Specialty specialty) {
        SpecialtyResponseDTO dto = new SpecialtyResponseDTO();
        dto.setSpecialtyId(specialty.getSpecialtyId());
        dto.setName(specialty.getName());
        dto.setDescription(specialty.getDescription());
        
        // Convert clinic
        if (specialty.getClinic() != null) {
            SpecialtyResponseDTO.ClinicDTO clinicDTO = new SpecialtyResponseDTO.ClinicDTO();
            clinicDTO.setClinicId(specialty.getClinic().getClinicId());
            clinicDTO.setName(specialty.getClinic().getName());
            clinicDTO.setAddress(specialty.getClinic().getAddress());
            clinicDTO.setPhoneNumber(specialty.getClinic().getPhoneNumber());
            clinicDTO.setEmail(specialty.getClinic().getEmail());
            dto.setClinic(clinicDTO);
        }
        
        dto.setDoctorCount(doctorSpecialtyRepository.countBySpecialtySpecialtyId(specialty.getSpecialtyId()));
        
        return dto;
    }
} 
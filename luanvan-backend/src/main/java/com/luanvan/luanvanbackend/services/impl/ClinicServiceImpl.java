package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.services.ClinicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClinicServiceImpl implements ClinicService {

    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    // @Cacheable(value = "clinics", key = "#clinicId") // Tạm thời tắt cache
    public Clinic getClinicById(Long clinicId) {
        return clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId));
    }

    @Override
    // @Cacheable(value = "clinics", key = "'dto_' + #clinicId") // Tạm thời tắt cache
    public ClinicResponseDTO getClinicResponseDTOById(Long clinicId) {
        Clinic clinic = getClinicById(clinicId);
        return convertToResponseDTO(clinic);
    }

    @Override
    // @Cacheable(value = "clinics", key = "'all'") // Tạm thời tắt cache
    public List<Clinic> getAllClinics() {
        return clinicRepository.findAll();
    }

    @Override
    public Page<ClinicResponseDTO> getAllClinicsDTO(Pageable pageable) {
        return clinicRepository.findAll(pageable).map(this::convertToResponseDTO);
    }

    @Override
    public Page<Clinic> getAllClinics(Pageable pageable) {
        return clinicRepository.findAll(pageable);
    }

    @Override
    public Page<Clinic> searchClinicsByName(String name, Pageable pageable) {
        return clinicRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Override
    public Page<ClinicResponseDTO> searchClinicsByNameDTO(String name, Pageable pageable) {
        return clinicRepository.findByNameContainingIgnoreCase(name, pageable).map(this::convertToResponseDTO);
    }

    @Override
    @Transactional
    @CacheEvict(value = "clinics", allEntries = true) // Clear cache khi tạo mới
    public Clinic createClinic(ClinicDTO clinicDTO) {
        // Kiểm tra email và số điện thoại đã tồn tại chưa
        if (clinicDTO.getEmail() != null && !clinicDTO.getEmail().isEmpty() && 
                clinicRepository.findByEmail(clinicDTO.getEmail()) != null) {
            throw new RuntimeException("Email đã được sử dụng bởi phòng khám khác");
        }
        
        if (clinicDTO.getPhoneNumber() != null && !clinicDTO.getPhoneNumber().isEmpty() && 
                clinicRepository.findByPhoneNumber(clinicDTO.getPhoneNumber()) != null) {
            throw new RuntimeException("Số điện thoại đã được sử dụng bởi phòng khám khác");
        }
        
        // Tạo phòng khám mới
        Clinic clinic = new Clinic();
        clinic.setName(clinicDTO.getName());
        clinic.setAddress(clinicDTO.getAddress());
        clinic.setPhoneNumber(clinicDTO.getPhoneNumber());
        clinic.setEmail(clinicDTO.getEmail());
        clinic.setLogoURL(clinicDTO.getLogoURL());
        clinic.setDescription(clinicDTO.getDescription());
        clinic.setWorkingHours(clinicDTO.getWorkingHours());
        clinic.setHistory(clinicDTO.getHistory());
        clinic.setVision(clinicDTO.getVision());
        clinic.setMission(clinicDTO.getMission());
        clinic.setCoreValues(clinicDTO.getCoreValues());
        clinic.setFacilitiesDescription(clinicDTO.getFacilitiesDescription());
        clinic.setEquipmentDescription(clinicDTO.getEquipmentDescription());
        
        return clinicRepository.save(clinic);
    }

    @Override
    @Transactional
    @Caching(
        put = @CachePut(value = "clinics", key = "#clinicId"),
        evict = @CacheEvict(value = "clinics", key = "'all'")
    )
    public Clinic updateClinic(Long clinicId, ClinicUpdateDTO clinicUpdateDTO) {
        Clinic clinic = getClinicById(clinicId);
        
        // Kiểm tra email và số điện thoại đã tồn tại chưa nếu có thay đổi
        if (clinicUpdateDTO.getEmail() != null && !clinicUpdateDTO.getEmail().isEmpty() && 
                !clinicUpdateDTO.getEmail().equals(clinic.getEmail())) {
            Clinic existingClinic = clinicRepository.findByEmail(clinicUpdateDTO.getEmail());
            if (existingClinic != null && !existingClinic.getClinicId().equals(clinicId)) {
                throw new RuntimeException("Email đã được sử dụng bởi phòng khám khác");
            }
        }
        
        if (clinicUpdateDTO.getPhoneNumber() != null && !clinicUpdateDTO.getPhoneNumber().isEmpty() && 
                !clinicUpdateDTO.getPhoneNumber().equals(clinic.getPhoneNumber())) {
            Clinic existingClinic = clinicRepository.findByPhoneNumber(clinicUpdateDTO.getPhoneNumber());
            if (existingClinic != null && !existingClinic.getClinicId().equals(clinicId)) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi phòng khám khác");
            }
        }
        
        // Cập nhật thông tin
        if (clinicUpdateDTO.getName() != null) {
            clinic.setName(clinicUpdateDTO.getName());
        }
        
        if (clinicUpdateDTO.getAddress() != null) {
            clinic.setAddress(clinicUpdateDTO.getAddress());
        }
        
        if (clinicUpdateDTO.getPhoneNumber() != null) {
            clinic.setPhoneNumber(clinicUpdateDTO.getPhoneNumber());
        }
        
        if (clinicUpdateDTO.getEmail() != null) {
            clinic.setEmail(clinicUpdateDTO.getEmail());
        }
        
        if (clinicUpdateDTO.getDescription() != null) {
            clinic.setDescription(clinicUpdateDTO.getDescription());
        }
        
        if (clinicUpdateDTO.getWorkingHours() != null) {
            clinic.setWorkingHours(clinicUpdateDTO.getWorkingHours());
        }
        
        if (clinicUpdateDTO.getHistory() != null) {
            clinic.setHistory(clinicUpdateDTO.getHistory());
        }
        
        if (clinicUpdateDTO.getVision() != null) {
            clinic.setVision(clinicUpdateDTO.getVision());
        }
        
        if (clinicUpdateDTO.getMission() != null) {
            clinic.setMission(clinicUpdateDTO.getMission());
        }
        
        if (clinicUpdateDTO.getCoreValues() != null) {
            clinic.setCoreValues(clinicUpdateDTO.getCoreValues());
        }
        
        if (clinicUpdateDTO.getFacilitiesDescription() != null) {
            clinic.setFacilitiesDescription(clinicUpdateDTO.getFacilitiesDescription());
        }
        
        if (clinicUpdateDTO.getEquipmentDescription() != null) {
            clinic.setEquipmentDescription(clinicUpdateDTO.getEquipmentDescription());
        }
        
        return clinicRepository.save(clinic);
    }

    @Override
    @Transactional
    @CachePut(value = "clinics", key = "#clinicId")
    public Clinic updateLogo(Long clinicId, String logoURL) {
        Clinic clinic = getClinicById(clinicId);
        clinic.setLogoURL(logoURL);
        return clinicRepository.save(clinic);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "clinics", key = "#clinicId"),
        @CacheEvict(value = "clinics", key = "'all'")
    })
    public boolean deleteClinic(Long clinicId) {
        Clinic clinic = getClinicById(clinicId);

        // Kiểm tra xem phòng khám còn chuyên khoa nào không
        long specialtyCount = specialtyRepository.countByClinicClinicId(clinicId);
        if (specialtyCount > 0) {
            throw new IllegalStateException("Không thể xóa phòng khám vì vẫn còn " + specialtyCount + " chuyên khoa liên kết.");
        }

        clinicRepository.delete(clinic);
        return true;
    }

    private ClinicResponseDTO convertToResponseDTO(Clinic clinic) {
        return new ClinicResponseDTO(
                clinic.getClinicId(),
                clinic.getName(),
                clinic.getAddress(),
                clinic.getPhoneNumber(),
                clinic.getEmail(),
                clinic.getLogoURL(),
                clinic.getDescription(),
                clinic.getWorkingHours(),
                clinic.getHistory(),
                clinic.getVision(),
                clinic.getMission(),
                clinic.getCoreValues(),
                clinic.getFacilitiesDescription(),
                clinic.getEquipmentDescription()
        );
    }
} 
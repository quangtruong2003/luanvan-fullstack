package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.dto.mapper.ClinicMapper;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.exception.ResourceNotFoundException;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.services.ClinicService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClinicServiceImpl implements ClinicService {
    
    private static final Logger log = LoggerFactory.getLogger(ClinicServiceImpl.class);

    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private SpecialtyRepository specialtyRepository;
    
    @Autowired
    private ClinicMapper clinicMapper;

    @Override
    // @Cacheable(value = "clinics", key = "#clinicId") // Tạm thời tắt cache
    public Clinic getClinicById(Long clinicId) {
        log.info("Fetching clinic with id: {}", clinicId);
        return findClinicById(clinicId);
    }

    @Override
    // @Cacheable(value = "clinics", key = "'dto_' + #clinicId") // Tạm thời tắt cache
    public ClinicResponseDTO getClinicResponseDTOById(Long clinicId) {
        log.info("Fetching clinic DTO with id: {}", clinicId);
        return clinicMapper.toResponseDTO(getClinicById(clinicId));
    }

    @Override
    // @Cacheable(value = "clinics", key = "'all'") // Tạm thời tắt cache
    public List<Clinic> getAllClinics() {
        log.info("Fetching all clinics");
        return clinicRepository.findAll();
    }

    @Override
    public Page<ClinicResponseDTO> getAllClinicsDTO(Pageable pageable) {
        log.info("Fetching all clinics as DTO with pagination: {}", pageable);
        return clinicRepository.findAll(pageable).map(clinicMapper::toResponseDTO);
    }

    @Override
    public Page<Clinic> getAllClinics(Pageable pageable) {
        log.info("Fetching all clinics with pagination: {}", pageable);
        return clinicRepository.findAll(pageable);
    }

    @Override
    public Page<Clinic> searchClinicsByName(String name, Pageable pageable) {
        log.info("Searching clinics with name containing: {}", name);
        return clinicRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    @Override
    public Page<ClinicResponseDTO> searchClinicsByNameDTO(String name, Pageable pageable) {
        log.info("Searching clinics as DTO with name containing: {}", name);
        return clinicRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(clinicMapper::toResponseDTO);
    }

    @Override
    @Transactional
    @CacheEvict(value = "clinics", allEntries = true) // Clear cache khi tạo mới
    public Clinic createClinic(ClinicDTO clinicDTO) {
        log.info("Creating new clinic: {}", clinicDTO);
        
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
        log.info("Updating clinic with id: {}", clinicId);
        
        Clinic clinic = findClinicById(clinicId);
        
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
        log.info("Updating logo for clinic with id: {}", clinicId);
        
        Clinic clinic = findClinicById(clinicId);
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
        log.info("Deleting clinic with id: {}", clinicId);
        
        // Kiểm tra xem phòng khám còn chuyên khoa nào không
        long specialtyCount = specialtyRepository.countByClinicClinicId(clinicId);
        if (specialtyCount > 0) {
            throw new IllegalStateException("Không thể xóa phòng khám vì vẫn còn " + specialtyCount + " chuyên khoa liên kết.");
        }

        clinicRepository.deleteById(clinicId);
        return true;
    }

    @Override
    public List<Specialty> getSpecialtiesByClinic(Long clinicId) {
        log.info("Fetching specialties for clinic with id: {}", clinicId);
        
        // Check if clinic exists
        if (!clinicRepository.existsById(clinicId)) {
            throw new ResourceNotFoundException("Clinic", "id", clinicId);
        }
        
        return specialtyRepository.findByClinicClinicId(clinicId);
    }
    
    private Clinic findClinicById(Long clinicId) {
        return clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", "id", clinicId));
    }
} 
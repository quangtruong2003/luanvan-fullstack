package com.luanvan.luanvanbackend.dto.mapper;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import com.luanvan.luanvanbackend.repositories.DoctorSpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.StandardWorkShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ClinicMapper {

    @Autowired
    private SpecialtyRepository specialtyRepository;
    
    @Autowired
    private DoctorSpecialtyRepository doctorSpecialtyRepository;
    
    @Autowired
    private StandardWorkShiftRepository standardWorkShiftRepository;

    public ClinicResponseDTO toResponseDTO(Clinic clinic) {
        if (clinic == null) {
            return null;
        }
        
        ClinicResponseDTO dto = new ClinicResponseDTO();
        dto.setClinicId(clinic.getClinicId());
        dto.setName(clinic.getName());
        dto.setAddress(clinic.getAddress());
        dto.setPhoneNumber(clinic.getPhoneNumber());
        dto.setEmail(clinic.getEmail());
        dto.setLogoURL(clinic.getLogoURL());
        dto.setDescription(clinic.getDescription());
        
        dto.setHistory(clinic.getHistory());
        dto.setVision(clinic.getVision());
        dto.setMission(clinic.getMission());
        dto.setCoreValues(clinic.getCoreValues());
        dto.setFacilitiesDescription(clinic.getFacilitiesDescription());
        dto.setEquipmentDescription(clinic.getEquipmentDescription());

        // Lấy danh sách chuyên khoa
        List<Specialty> specialties = specialtyRepository.findByClinicClinicId(clinic.getClinicId());
        List<ClinicResponseDTO.SpecialtyInfo> specialtyInfos = specialties.stream()
                .map(specialty -> {
                    long doctorCount = doctorSpecialtyRepository.countBySpecialtySpecialtyId(specialty.getSpecialtyId());
                    return new ClinicResponseDTO.SpecialtyInfo(
                            specialty.getSpecialtyId(),
                            specialty.getName(),
                            specialty.getDescription(),
                            doctorCount
                    );
                })
                .collect(Collectors.toList());
        dto.setSpecialties(specialtyInfos);

        // Lấy danh sách ca làm việc tiêu chuẩn
        List<StandardWorkShift> standardWorkShifts = standardWorkShiftRepository.findByClinicClinicId(clinic.getClinicId());
        List<ClinicResponseDTO.StandardWorkShiftInfo> standardWorkShiftInfos = standardWorkShifts.stream()
                .map(shift -> new ClinicResponseDTO.StandardWorkShiftInfo(
                        shift.getShiftId(),
                        shift.getShiftName(),
                        shift.getDayOfWeek(),
                        shift.getStartTime(),
                        shift.getEndTime(),
                        shift.isDefault()
                ))
                .collect(Collectors.toList());
        dto.setStandardWorkShifts(standardWorkShiftInfos);

        // Convert standard shifts to working hours array format for API compatibility
        List<ClinicResponseDTO.WorkingHoursInfo> workingHoursArray = standardWorkShifts.stream()
                .map(shift -> new ClinicResponseDTO.WorkingHoursInfo(
                        shift.getShiftId(),
                        shift.getDayOfWeek(),
                        shift.getStartTime(),
                        shift.getEndTime(),
                        shift.isDefault()
                ))
                .collect(Collectors.toList());
        dto.setWorkingHoursArray(workingHoursArray);

        return dto;
    }

    public Clinic toEntity(ClinicDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Clinic clinic = new Clinic();
        clinic.setName(dto.getName());
        clinic.setAddress(dto.getAddress());
        clinic.setPhoneNumber(dto.getPhoneNumber());
        clinic.setEmail(dto.getEmail());
        clinic.setLogoURL(dto.getLogoURL());
        clinic.setDescription(dto.getDescription());
        
        clinic.setHistory(dto.getHistory());
        clinic.setVision(dto.getVision());
        clinic.setMission(dto.getMission());
        clinic.setCoreValues(dto.getCoreValues());
        clinic.setFacilitiesDescription(dto.getFacilitiesDescription());
        clinic.setEquipmentDescription(dto.getEquipmentDescription());

        return clinic;
    }

    public void updateEntityFromDTO(Clinic clinic, ClinicUpdateDTO dto) {
        if (clinic == null || dto == null) {
            return;
        }
        
        if (dto.getName() != null) {
            clinic.setName(dto.getName());
        }
        if (dto.getAddress() != null) {
            clinic.setAddress(dto.getAddress());
        }
        if (dto.getPhoneNumber() != null) {
            clinic.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getEmail() != null) {
            clinic.setEmail(dto.getEmail());
        }
        if (dto.getDescription() != null) {
            clinic.setDescription(dto.getDescription());
        }
        
        if (dto.getHistory() != null) {
            clinic.setHistory(dto.getHistory());
        }
        if (dto.getVision() != null) {
            clinic.setVision(dto.getVision());
        }
        if (dto.getMission() != null) {
            clinic.setMission(dto.getMission());
        }
        if (dto.getCoreValues() != null) {
            clinic.setCoreValues(dto.getCoreValues());
        }
        if (dto.getFacilitiesDescription() != null) {
            clinic.setFacilitiesDescription(dto.getFacilitiesDescription());
        }
        if (dto.getEquipmentDescription() != null) {
            clinic.setEquipmentDescription(dto.getEquipmentDescription());
        }
    }
} 
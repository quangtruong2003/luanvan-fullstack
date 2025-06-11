package com.luanvan.luanvanbackend.dto.mapper;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import org.springframework.stereotype.Component;

@Component
public class ClinicMapper {

    public ClinicResponseDTO toResponseDTO(Clinic clinic) {
        if (clinic == null) {
            return null;
        }
        
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
        clinic.setWorkingHours(dto.getWorkingHours());
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
        if (dto.getWorkingHours() != null) {
            clinic.setWorkingHours(dto.getWorkingHours());
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
package com.luanvan.luanvanbackend.dto;

import com.luanvan.luanvanbackend.entities.Clinic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialtyResponseDTO {
    private Long specialtyId;
    private String name;
    private String description;
    private ClinicDTO clinic;
    private Long doctorCount;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClinicDTO {
        private Long clinicId;
        private String name;
        private String address;
        private String phoneNumber;
        private String email;
    }
} 
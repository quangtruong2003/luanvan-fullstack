package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponseDTO {
    private Long doctorId;
    private UserDTO user;
    private String bio;
    private Integer yearsOfExperience;
    private List<SpecialtyResponseDTO> specialties;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String imageUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecialtyResponseDTO {
        private Long specialtyId;
        private String name;
        private String description;
        private boolean isPrimary;
        private ClinicDTO clinic;
    }
    
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
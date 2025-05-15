package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private String bio;
    private Integer yearsOfExperience;
    private String profilePictureURL;
    private List<Long> specialtyIds; // Danh sách ID các chuyên khoa
    private Long primarySpecialtyId; // ID chuyên khoa chính
}
package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    
    @Size(max = 1000, message = "Tiểu sử không được vượt quá 1000 ký tự")
    private String bio;
    
    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    @Max(value = 60, message = "Số năm kinh nghiệm không được vượt quá 60 năm")
    private Integer yearsOfExperience; // Will be mapped from "years_of_experience" by SNAKE_CASE strategy
    
    @Size(max = 10, message = "Không thể gán quá 10 chuyên khoa cho một bác sĩ")
    private List<Long> specialtyIds; // Will be mapped from "specialty_ids" by SNAKE_CASE strategy  
    
    private Long primarySpecialtyId; // Will be mapped from "primary_specialty_id" by SNAKE_CASE strategy
}
package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorUpdateDTO {
    
    @Size(max = 1000, message = "Tiểu sử không được vượt quá 1000 ký tự")
    private String bio;
    
    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    @Max(value = 60, message = "Số năm kinh nghiệm không được vượt quá 60 năm")
    private Integer yearsOfExperience;
} 
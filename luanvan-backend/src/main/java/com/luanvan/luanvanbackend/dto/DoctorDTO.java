package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorDTO {
    
    @Size(max = 1000, message = "Tiểu sử không được vượt quá 1000 ký tự")
    private String bio;
      @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    @Max(value = 60, message = "Số năm kinh nghiệm không được vượt quá 60 năm")
    @JsonProperty("years_of_experience")
    @JsonAlias({"yearsOfExperience", "years_of_experience"})
    private Integer yearsOfExperience;
    
    @Size(max = 10, message = "Không thể gán quá 10 chuyên khoa cho một bác sĩ")
    @JsonProperty("specialty_ids")
    @JsonAlias({"specialtyIds", "specialty_ids"})
    private List<Long> specialtyIds;
    
    @JsonProperty("primary_specialty_id")
    @JsonAlias({"primarySpecialtyId", "primary_specialty_id"})
    private Long primarySpecialtyId;
}
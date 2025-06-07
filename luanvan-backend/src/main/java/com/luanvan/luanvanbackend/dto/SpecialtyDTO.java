package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialtyDTO {
    
    @NotBlank(message = "Tên chuyên khoa không được để trống")
    @Size(min = 2, max = 100, message = "Tên chuyên khoa phải từ 2-100 ký tự")
    private String name;
    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
    
    @NotNull(message = "ID phòng khám không được để trống")
    private Long clinicId;
} 
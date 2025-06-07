package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentStatusUpdateDTO {
    
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(SCHEDULED|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW)$", 
             message = "Trạng thái phải là SCHEDULED, CONFIRMED, COMPLETED, CANCELLED hoặc NO_SHOW")
    private String status;
    
    @Size(max = 500, message = "Lý do hủy không được vượt quá 500 ký tự")
    private String cancellationReason;
} 
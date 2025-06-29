package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentStatusUpdateDTO {
    
    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "^(PENDING_PAYMENT|CONFIRMED|COMPLETED|CANCELLED_BY_PATIENT|CANCELLED_BY_CLINIC|PAYMENT_FAILED|NO_SHOW)$", 
             message = "Trạng thái không hợp lệ")
    private String status;
    
    @Size(max = 500, message = "Lý do hủy không được vượt quá 500 ký tự")
    @JsonAlias("cancellation_reason")
    private String cancellationReason;
} 
package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    
    @NotNull(message = "ID lịch hẹn không được để trống")
    @JsonProperty(value = "appointmentId", access = JsonProperty.Access.WRITE_ONLY)
    private Long appointmentId;
    
    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private Double amount;
    
    @NotBlank(message = "Provider thanh toán không được để trống")
    @JsonProperty(value = "paymentProvider", access = JsonProperty.Access.WRITE_ONLY)
    private String paymentProvider; // MOMO hoặc VNPAY
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    @JsonProperty(value = "returnUrl", access = JsonProperty.Access.WRITE_ONLY)
    private String returnUrl; // URL trả về sau khi thanh toán
    
    @JsonProperty(value = "cancelUrl", access = JsonProperty.Access.WRITE_ONLY)
    private String cancelUrl; // URL khi hủy thanh toán
    
    // Thông tin người dùng
    @NotNull(message = "ID người dùng không được để trống")
    @JsonProperty(value = "userId", access = JsonProperty.Access.WRITE_ONLY)
    private Long userId;
    
    @JsonProperty(value = "customerName", access = JsonProperty.Access.WRITE_ONLY)
    private String customerName;
    
    @JsonProperty(value = "customerEmail", access = JsonProperty.Access.WRITE_ONLY)
    private String customerEmail;
    
    @JsonProperty(value = "customerPhone", access = JsonProperty.Access.WRITE_ONLY)
    private String customerPhone;
    
    // Thông tin device để xử lý deep link
    @JsonProperty(value = "deviceType", access = JsonProperty.Access.WRITE_ONLY)
    private String deviceType; // WEB, MOBILE_IOS, MOBILE_ANDROID
    
    @JsonProperty(value = "userAgent", access = JsonProperty.Access.WRITE_ONLY)
    private String userAgent;
    
    @JsonProperty(value = "clientIp", access = JsonProperty.Access.WRITE_ONLY)
    private String clientIp;
} 
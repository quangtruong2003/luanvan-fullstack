package com.luanvan.luanvanbackend.dto;

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
    private Long appointmentId;
    
    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private Double amount;
    
    @NotBlank(message = "Provider thanh toán không được để trống")
    private String paymentProvider; // MOMO hoặc VNPAY
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    private String returnUrl; // URL trả về sau khi thanh toán
    private String cancelUrl; // URL khi hủy thanh toán
    
    // Thông tin người dùng
    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;
    
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    // Thông tin device để xử lý deep link
    private String deviceType; // WEB, MOBILE_IOS, MOBILE_ANDROID
    private String userAgent;
    private String clientIp;
} 
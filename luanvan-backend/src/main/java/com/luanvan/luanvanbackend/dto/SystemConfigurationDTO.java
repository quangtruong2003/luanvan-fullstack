package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigurationDTO {
    
    private Boolean enableDeposit;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền đặt cọc mặc định phải >= 0")
    private BigDecimal defaultDepositAmount;
    
    // MoMo Configuration
    private Boolean enableMomo;
    
    @Size(max = 50, message = "Mã đối tác MoMo không được vượt quá 50 ký tự")
    private String momoPartnerCode;

    @Size(max = 50, message = "Khóa truy cập MoMo không được vượt quá 50 ký tự")
    private String momoAccessKey;

    @Size(max = 255, message = "Khóa bí mật MoMo không được vượt quá 255 ký tự")
    private String momoSecretKey;
    
    @Size(max = 255, message = "API Endpoint của MoMo không được vượt quá 255 ký tự")
    private String momoApiEndpoint;

    // VNPay Configuration
    private Boolean enableVnPay;

    @Size(max = 50, message = "Mã TMN Code của VNPay không được vượt quá 50 ký tự")
    private String vnpayTmnCode;

    @Size(max = 255, message = "Khóa bí mật của VNPay không được vượt quá 255 ký tự")
    private String vnpaySecretKey;
    
    // General Payment Settings
    @Pattern(regexp = "momo|vnpay", message = "Phương thức thanh toán mặc định phải là 'momo' hoặc 'vnpay'")
    private String defaultPaymentMethod;

    @DecimalMin(value = "0.0", inclusive = true, message = "Phí khám bệnh phải >= 0")
    private BigDecimal examinationFee;

    @Min(value = 0, message = "Giới hạn hủy lịch phải là số không âm")
    private Integer patientCancellationTimeLimitHours;
    
    @Min(value = 1, message = "Thời gian chờ thanh toán phải ít nhất là 1 phút")
    private Integer paymentRetryTimeoutMinutes;

    @Size(max = 2000, message = "Nội dung chính sách không được vượt quá 2000 ký tự")
    private String nonRefundableDepositPolicy;
}
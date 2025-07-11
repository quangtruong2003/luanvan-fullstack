package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("enableDeposit")
    private Boolean enableDeposit;
    
    @JsonProperty("defaultDepositAmount")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền đặt cọc mặc định phải >= 0")
    private BigDecimal defaultDepositAmount;
    
    // MoMo Configuration
    @JsonProperty("enableMomo")
    private Boolean enableMomo;
    
    @JsonProperty("momoPartnerCode")
    @Size(max = 50, message = "Mã đối tác MoMo không được vượt quá 50 ký tự")
    private String momoPartnerCode;

    @JsonProperty("momoAccessKey")
    @Size(max = 50, message = "Khóa truy cập MoMo không được vượt quá 50 ký tự")
    private String momoAccessKey;

    @JsonProperty("momoSecretKey")
    @Size(max = 255, message = "Khóa bí mật MoMo không được vượt quá 255 ký tự")
    private String momoSecretKey;
    
    @JsonProperty("momoApiEndpoint")
    @Size(max = 255, message = "API Endpoint của MoMo không được vượt quá 255 ký tự")
    private String momoApiEndpoint;

    // VNPay Configuration
    @JsonProperty("enableVNPay")
    private Boolean enableVNPay;

    @JsonProperty("vnpayTmnCode")
    @Size(max = 50, message = "Mã TMN Code của VNPay không được vượt quá 50 ký tự")
    private String vnpayTmnCode;

    @JsonProperty("vnpaySecretKey")
    @Size(max = 255, message = "Khóa bí mật của VNPay không được vượt quá 255 ký tự")
    private String vnpaySecretKey;
    
    // General Payment Settings
    @JsonProperty("defaultPaymentMethod")
    @Pattern(regexp = "momo|vnpay", message = "Phương thức thanh toán mặc định phải là 'momo' hoặc 'vnpay'")
    private String defaultPaymentMethod;

    @JsonProperty("patientCancellationTimeLimitHours")
    private Integer patientCancellationTimeLimitHours;
    
    @JsonProperty("paymentRetryTimeoutMinutes")
    private Integer paymentRetryTimeoutMinutes;

    @JsonProperty("nonRefundableDepositPolicyText")
    @Size(max = 1000)
    private String nonRefundableDepositPolicyText;
}
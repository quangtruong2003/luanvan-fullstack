package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonAlias("enable_deposit")
    private Boolean enableDeposit;
    
    @JsonProperty("defaultDepositAmount")
    @JsonAlias("default_deposit_amount")
    @DecimalMin(value = "0.0", inclusive = true, message = "Số tiền đặt cọc mặc định phải >= 0")
    private BigDecimal defaultDepositAmount;
    
    // MoMo Configuration
    @JsonProperty("enableMomo")
    @JsonAlias("enable_momo")
    private Boolean enableMomo;
    
    @JsonProperty("momoPartnerCode")
    @JsonAlias("momo_partner_code")
    @Size(max = 50, message = "Mã đối tác MoMo không được vượt quá 50 ký tự")
    private String momoPartnerCode;

    @JsonProperty("momoAccessKey")
    @JsonAlias("momo_access_key")
    @Size(max = 50, message = "Khóa truy cập MoMo không được vượt quá 50 ký tự")
    private String momoAccessKey;

    @JsonProperty("momoSecretKey")
    @JsonAlias("momo_secret_key")
    @Size(max = 255, message = "Khóa bí mật MoMo không được vượt quá 255 ký tự")
    private String momoSecretKey;
    
    @JsonProperty("momoApiEndpoint")
    @JsonAlias("momo_api_endpoint")
    @Size(max = 255, message = "API Endpoint của MoMo không được vượt quá 255 ký tự")
    private String momoApiEndpoint;

    // VNPay Configuration
    @JsonProperty("enableVNPay")
    @JsonAlias({"enable_vn_pay", "enableVnPay"})
    private Boolean enableVNPay;

    @JsonProperty("vnpayTmnCode")
    @JsonAlias("vnpay_tmn_code")
    @Size(max = 50, message = "Mã TMN Code của VNPay không được vượt quá 50 ký tự")
    private String vnpayTmnCode;

    @JsonProperty("vnpaySecretKey")
    @JsonAlias("vnpay_secret_key")
    @Size(max = 255, message = "Khóa bí mật của VNPay không được vượt quá 255 ký tự")
    private String vnpaySecretKey;
    
    // General Payment Settings
    @JsonProperty("defaultPaymentMethod")
    @JsonAlias("default_payment_method")
    @Pattern(regexp = "momo|vnpay", message = "Phương thức thanh toán mặc định phải là 'momo' hoặc 'vnpay'")
    private String defaultPaymentMethod;

    @JsonProperty("patientCancellationTimeLimitHours")
    @JsonAlias("patient_cancellation_time_limit_hours")
    private Integer patientCancellationTimeLimitHours;
    
    @JsonProperty("paymentRetryTimeoutMinutes")
    @JsonAlias("payment_retry_timeout_minutes")
    private Integer paymentRetryTimeoutMinutes;

    @JsonProperty("nonRefundableDepositPolicyText")
    @JsonAlias("non_refundable_deposit_policy_text")
    @Size(max = 1000)
    private String nonRefundableDepositPolicyText;
}
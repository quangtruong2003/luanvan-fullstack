package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
    @Size(max = 50, message = "Mã đối tác MoMo không được vượt quá 50 ký tự")
    private String momoPartnerCode;
    @Size(max = 100, message = "Access key MoMo không được vượt quá 100 ký tự")
    private String momoAccessKey;
    @Size(max = 100, message = "Secret key MoMo không được vượt quá 100 ký tự")
    private String momoSecretKey;
    @Size(max = 200, message = "API endpoint MoMo không được vượt quá 200 ký tự")
    private String momoApiEndpoint;
    @Min(value = 1, message = "Thời gian retry thanh toán phải >= 1 phút")
    private Integer paymentRetryTimeoutMinutes;
    @Min(value = 1, message = "Thời hạn hủy lịch phải >= 1 giờ")
    private Integer patientCancellationTimeLimitHours;
    @Size(max = 1000, message = "Chính sách đặt cọc không được vượt quá 1000 ký tự")
    private String nonRefundableDepositPolicyText;
}
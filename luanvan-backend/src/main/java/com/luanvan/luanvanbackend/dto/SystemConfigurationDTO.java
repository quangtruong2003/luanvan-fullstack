package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigurationDTO {
    private Boolean enableDeposit;
    private BigDecimal defaultDepositAmount;
    private String momoPartnerCode;
    private String momoAccessKey;
    private String momoSecretKey;
    private String momoApiEndpoint;
    private Integer paymentRetryTimeoutMinutes;
    private Integer patientCancellationTimeLimitHours;
    private String nonRefundableDepositPolicyText;
}
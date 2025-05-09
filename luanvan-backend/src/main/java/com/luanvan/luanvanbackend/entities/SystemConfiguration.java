package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "system_configuration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long configId;
    
    private boolean enableDeposit;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal defaultDepositAmount;
    
    private String momoPartnerCode;
    private String momoAccessKey;
    private String momoSecretKey;
    private String momoApiEndpoint;
    private Integer paymentRetryTimeoutMinutes;
    private Integer patientCancellationTimeLimitHours;
    
    @Column(columnDefinition = "TEXT")
    private String nonRefundableDepositPolicyText;
}

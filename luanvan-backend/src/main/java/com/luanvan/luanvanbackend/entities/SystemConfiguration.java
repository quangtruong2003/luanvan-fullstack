package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Entity
@Table(name = "system_configuration")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long configId;
    
    @Column(nullable = false)
    @ColumnDefault("true")
    private Boolean enableDeposit = true;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal defaultDepositAmount;
    
    // MoMo Configuration
    @Column(nullable = false)
    @ColumnDefault("true")
    private Boolean enableMomo = true;
    
    private String momoPartnerCode;
    private String momoAccessKey;
    private String momoSecretKey;
    private String momoApiEndpoint;

    // VNPay Configuration
    @Column(name = "enable_vn_pay", nullable = false)
    @ColumnDefault("true")
    private Boolean enableVNPay = true;

    private String vnpayTmnCode;
    private String vnpaySecretKey;
    
    // General Payment Settings
    private String defaultPaymentMethod;
    private Integer patientCancellationTimeLimitHours;
    private Integer paymentRetryTimeoutMinutes;

    @Column(columnDefinition = "TEXT")
    private String nonRefundableDepositPolicyText;
}

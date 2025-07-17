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
    @Column(name = "config_id")
    private Long configId;
    
    @Column(name = "enable_deposit", nullable = false)
    @ColumnDefault("true")
    private Boolean enableDeposit = true;
    
    @Column(name = "default_deposit_amount", precision = 10, scale = 2)
    private BigDecimal defaultDepositAmount;
    
    // MoMo Configuration
    @Column(name = "enable_momo", nullable = false)
    @ColumnDefault("true")
    private Boolean enableMomo = true;
    
    @Column(name = "momo_partner_code")
    private String momoPartnerCode;
    
    @Column(name = "momo_access_key")
    private String momoAccessKey;
    
    @Column(name = "momo_secret_key")
    private String momoSecretKey;
    
    @Column(name = "momo_api_endpoint")
    private String momoApiEndpoint;

    // VNPay Configuration
    @Column(name = "enable_vn_pay", nullable = false)
    @ColumnDefault("true")
    private Boolean enableVnPay = true;

    @Column(name = "vnpay_tmn_code")
    private String vnpayTmnCode;
    
    @Column(name = "vnpay_secret_key")
    private String vnpaySecretKey;
    
    // General Payment Settings
    @Column(name = "default_payment_method")
    private String defaultPaymentMethod;
    
    @Column(name = "examination_fee", precision = 10, scale = 2)
    private BigDecimal examinationFee;

    @Column(name = "patient_cancellation_time_limit_hours")
    private Integer patientCancellationTimeLimitHours;
    
    @Column(name = "payment_retry_timeout_minutes")
    private Integer paymentRetryTimeoutMinutes;

    @Column(name = "non_refundable_deposit_policy", columnDefinition = "TEXT")
    private String nonRefundableDepositPolicy;
}

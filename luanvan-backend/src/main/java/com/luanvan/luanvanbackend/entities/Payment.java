package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;
    
    @Column(name = "order_id", unique = true, nullable = false)
    private String orderId; // ID đơn hàng trong hệ thống
    
    @Column(name = "gateway_order_id")
    private String gatewayOrderId; // ID đơn hàng từ payment gateway
    
    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId; // ID giao dịch từ payment gateway
    
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "VND";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private PaymentProvider provider;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "payment_url", length = 1000)
    private String paymentUrl;
    
    @Column(name = "qr_code", length = 1000)
    private String qrCode;
    
    @Column(name = "deep_link", length = 1000)
    private String deepLink;
    
    @Column(name = "return_url", length = 500)
    private String returnUrl;
    
    @Column(name = "cancel_url", length = 500)
    private String cancelUrl;
    
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "customer_email")
    private String customerEmail;
    
    @Column(name = "customer_phone")
    private String customerPhone;
    
    @Column(name = "client_ip")
    private String clientIp;
    
    @Column(name = "device_type")
    private String deviceType;
    
    @Column(name = "user_agent", length = 1000)
    private String userAgent;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
    
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Column(name = "callback_data", columnDefinition = "TEXT")
    private String callbackData;
    
    @Column(name = "error_code")
    private String errorCode;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Đặt thời gian hết hạn là 15 phút sau khi tạo
        if (expiredAt == null) {
            expiredAt = createdAt.plusMinutes(15);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum PaymentProvider {
        MOMO, VNPAY
    }
    
    public enum PaymentMethod {
        MOMO_WALLET,
        MOMO_ATM,
        MOMO_CREDIT_CARD,
        VNPAY_ATM,
        VNPAY_CREDIT_CARD,
        VNPAY_QR,
        VNPAY_BANK_TRANSFER
    }
    
    public enum PaymentStatus {
        PENDING,        // Đang chờ thanh toán
        PROCESSING,     // Đang xử lý
        SUCCESS,        // Thành công
        FAILED,         // Thất bại
        CANCELLED,      // Đã hủy
        EXPIRED,        // Hết hạn
        REFUNDED        // Đã hoàn tiền
    }
} 
package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    
    private String orderId; // ID đơn hàng trong hệ thống
    private String transactionId; // ID giao dịch từ payment gateway
    private Double amount; // Số tiền
    private String currency; // Loại tiền tệ (VND)
    
    private String paymentUrl; // URL để redirect người dùng
    private String qrCode; // QR code để quét (cho mobile)
    private String deepLink; // Deep link để mở app trên mobile
    
    private String status; // Trạng thái giao dịch
    private String message; // Thông báo
    private String provider; // Provider (MOMO, VNPAY)
    
    // Thông tin chi tiết
    private String paymentMethod; // Phương thức thanh toán
    private LocalDateTime createdAt; // Thời gian tạo
    private LocalDateTime expiredAt; // Thời gian hết hạn
    
    // Dữ liệu bổ sung từ gateway
    private String gatewayOrderId; // ID đơn hàng từ gateway
    private String gatewayTransactionId; // ID giao dịch từ gateway
    private String gatewayResponse; // Response raw từ gateway
    
    private boolean success; // Có thành công không
    private String errorCode; // Mã lỗi nếu có
    private String errorMessage; // Thông báo lỗi nếu có
} 
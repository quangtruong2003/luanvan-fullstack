package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackDTO {
    
    private String orderId; // ID đơn hàng trong hệ thống
    private String transactionId; // ID giao dịch từ payment gateway
    private Double amount; // Số tiền
    private String currency; // Loại tiền tệ
    
    private String status; // Trạng thái giao dịch
    private String resultCode; // Mã kết quả
    private String message; // Thông báo
    
    private String paymentMethod; // Phương thức thanh toán
    private String provider; // Provider (MOMO, VNPAY)
    
    // Dữ liệu xác thực
    private String signature; // Chữ ký
    private String mac; // MAC từ Momo
    private String secureHash; // Secure hash từ VNPay
    
    // Thông tin thời gian
    private String payTime; // Thời gian thanh toán
    private String transDate; // Ngày giao dịch
    
    // Dữ liệu raw từ callback
    private Map<String, String> rawData; // Toàn bộ dữ liệu callback
    
    // Momo specific fields
    private String partnerCode;
    private String accessKey;
    private String requestId;
    private String orderInfo;
    private String orderType;
    private String extraData;
    
    // VNPay specific fields
    private String vnp_TmnCode;
    private String vnp_TxnRef;
    private String vnp_ResponseCode;
    private String vnp_TransactionNo;
    private String vnp_BankCode;
    private String vnp_PayDate;
    private String vnp_OrderInfo;
} 
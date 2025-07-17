package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.PaymentRequestDTO;
import com.luanvan.luanvanbackend.dto.PaymentResponseDTO;
import com.luanvan.luanvanbackend.dto.PaymentCallbackDTO;
import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.entities.Appointment;

import java.util.Map;

public interface PaymentService {
    
    /**
     * Tạo đường link thanh toán với Momo
     * @param paymentRequest Thông tin thanh toán
     * @return URL để redirect người dùng
     */
    PaymentResponseDTO createMomoPayment(PaymentRequestDTO paymentRequest);
    
    /**
     * Tạo đường link thanh toán với VNPay
     * @param paymentRequest Thông tin thanh toán
     * @return URL để redirect người dùng
     */
    PaymentResponseDTO createVNPayPayment(PaymentRequestDTO paymentRequest) throws Exception;
    
    /**
     * Xử lý callback từ Momo
     * @param callbackData Dữ liệu từ Momo IPN
     * @return Kết quả xử lý
     */
    boolean handleMomoCallback(PaymentCallbackDTO callbackData);
    
    /**
     * Xử lý callback từ VNPay
     * @param callbackData Dữ liệu từ VNPay IPN
     * @return Kết quả xử lý
     */
    boolean handleVNPayCallback(PaymentCallbackDTO callbackData);

    AppointmentDTO handleVNPayReturn(Map<String, String> vnp_params);
    
    /**
     * Kiểm tra trạng thái thanh toán từ Momo
     * @param orderId ID đơn hàng
     * @return Trạng thái thanh toán
     */
    PaymentResponseDTO queryMomoPaymentStatus(String orderId);
    
    /**
     * Kiểm tra trạng thái thanh toán từ VNPay
     * @param orderId ID đơn hàng
     * @return Trạng thái thanh toán
     */
    PaymentResponseDTO queryVNPayPaymentStatus(String orderId);
    
    /**
     * Xác minh chữ ký từ payment gateway
     * @param data Dữ liệu cần xác minh
     * @param signature Chữ ký
     * @param provider Provider (MOMO hoặc VNPAY)
     * @return true nếu hợp lệ
     */
    boolean verifySignature(String data, String signature, String provider);
} 
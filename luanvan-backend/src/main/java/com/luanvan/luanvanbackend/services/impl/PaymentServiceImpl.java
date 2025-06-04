package com.luanvan.luanvanbackend.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luanvan.luanvanbackend.config.PaymentConfig;
import com.luanvan.luanvanbackend.dto.*;
import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.Payment;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.PaymentRepository;
import com.luanvan.luanvanbackend.services.PaymentService;
import com.luanvan.luanvanbackend.utils.PaymentUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentConfig paymentConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public PaymentResponseDTO createMomoPayment(PaymentRequestDTO request) {
        try {
            log.info("Creating Momo payment for appointment: {}", request.getAppointmentId());

            // Tìm appointment
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

            // Tạo order ID
            String orderId = PaymentUtils.generateOrderId("MOMO");
            String requestId = PaymentUtils.generateRequestId();

            // Tạo payment record
            Payment payment = new Payment();
            payment.setAppointment(appointment);
            payment.setOrderId(orderId);
            payment.setAmount(request.getAmount());
            payment.setCurrency("VND");
            payment.setProvider(Payment.PaymentProvider.MOMO);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setDescription(request.getDescription());
            payment.setCustomerName(request.getCustomerName());
            payment.setCustomerEmail(request.getCustomerEmail());
            payment.setCustomerPhone(request.getCustomerPhone());
            payment.setClientIp(request.getClientIp());
            payment.setDeviceType(request.getDeviceType());
            payment.setUserAgent(request.getUserAgent());
            payment.setReturnUrl(request.getReturnUrl());
            payment.setCancelUrl(request.getCancelUrl());

            // Chuẩn bị request Momo
            Map<String, String> momoParams = buildMomoRequest(request, orderId, requestId);
            
            // Tạo signature
            String rawSignature = buildMomoRawSignature(momoParams);
            String signature = PaymentUtils.createMomoSignature(rawSignature, paymentConfig.getMomo().getSecretKey());
            momoParams.put("signature", signature);

            // Log request để debug
            log.debug("Momo request params: {}", momoParams);
            log.debug("Momo raw signature: {}", rawSignature);

            // Gọi API Momo
            String momoEndpoint = paymentConfig.getMomo().getEndpoint() + paymentConfig.getMomo().getCreateOrderUrl();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(momoParams, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(momoEndpoint, entity, String.class);

            // Parse response
            Map<String, Object> momoResponse = objectMapper.readValue(response.getBody(), Map.class);
            log.debug("Momo response: {}", momoResponse);

            // Xử lý response
            PaymentResponseDTO paymentResponse = processMomoResponse(momoResponse, payment, request);
            
            // Lưu payment
            payment.setGatewayResponse(response.getBody());
            paymentRepository.save(payment);

            return paymentResponse;

        } catch (Exception e) {
            log.error("Error creating Momo payment: ", e);
            return PaymentResponseDTO.builder()
                    .success(false)
                    .errorCode("MOMO_ERROR")
                    .errorMessage("Lỗi tạo thanh toán Momo: " + e.getMessage())
                    .provider("MOMO")
                    .build();
        }
    }

    @Override
    public PaymentResponseDTO createVNPayPayment(PaymentRequestDTO request) {
        try {
            log.info("Creating VNPay payment for appointment: {}", request.getAppointmentId());

            // Tìm appointment
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

            // Tạo order ID
            String orderId = PaymentUtils.generateOrderId("VNPAY");

            // Tạo payment record
            Payment payment = new Payment();
            payment.setAppointment(appointment);
            payment.setOrderId(orderId);
            payment.setAmount(request.getAmount());
            payment.setCurrency("VND");
            payment.setProvider(Payment.PaymentProvider.VNPAY);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setDescription(request.getDescription());
            payment.setCustomerName(request.getCustomerName());
            payment.setCustomerEmail(request.getCustomerEmail());
            payment.setCustomerPhone(request.getCustomerPhone());
            payment.setClientIp(request.getClientIp());
            payment.setDeviceType(request.getDeviceType());
            payment.setUserAgent(request.getUserAgent());
            payment.setReturnUrl(request.getReturnUrl());
            payment.setCancelUrl(request.getCancelUrl());

            // Chuẩn bị request VNPay
            Map<String, String> vnpayParams = buildVNPayRequest(request, orderId);
            
            // Tạo secure hash
            String hashData = PaymentUtils.buildHashData(vnpayParams, "vnp_SecureHash");
            String secureHash = PaymentUtils.createVNPaySignature(hashData, paymentConfig.getVnpay().getHashSecret());
            vnpayParams.put("vnp_SecureHash", secureHash);

            // Tạo payment URL
            String paymentUrl = paymentConfig.getVnpay().getEndpoint() + 
                               paymentConfig.getVnpay().getPayUrl() + "?" + 
                               PaymentUtils.buildQueryString(vnpayParams);

            // Tạo deep link nếu cần
            String deepLink = buildVNPayDeepLink(request.getDeviceType(), vnpayParams);

            // Lưu payment
            payment.setPaymentUrl(paymentUrl);
            payment.setDeepLink(deepLink);
            payment.setGatewayResponse(objectMapper.writeValueAsString(vnpayParams));
            Payment savedPayment = paymentRepository.save(payment);

            log.debug("VNPay payment URL: {}", paymentUrl);

            return PaymentResponseDTO.builder()
                    .success(true)
                    .orderId(orderId)
                    .amount(request.getAmount())
                    .currency("VND")
                    .paymentUrl(paymentUrl)
                    .deepLink(deepLink)
                    .status("PENDING")
                    .message("Tạo thanh toán VNPay thành công")
                    .provider("VNPAY")
                    .createdAt(savedPayment.getCreatedAt())
                    .expiredAt(savedPayment.getExpiredAt())
                    .build();

        } catch (Exception e) {
            log.error("Error creating VNPay payment: ", e);
            return PaymentResponseDTO.builder()
                    .success(false)
                    .errorCode("VNPAY_ERROR")
                    .errorMessage("Lỗi tạo thanh toán VNPay: " + e.getMessage())
                    .provider("VNPAY")
                    .build();
        }
    }

    @Override
    public boolean handleMomoCallback(PaymentCallbackDTO callbackData) {
        try {
            log.info("Handling Momo callback for order: {}", callbackData.getOrderId());

            // Verify signature
            if (!verifyMomoSignature(callbackData)) {
                log.error("Invalid Momo signature for order: {}", callbackData.getOrderId());
                return false;
            }

            // Tìm payment
            Payment payment = paymentRepository.findByOrderId(callbackData.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

            // Cập nhật payment status
            updatePaymentFromMomoCallback(payment, callbackData);
            
            // Cập nhật appointment nếu thanh toán thành công
            if ("0".equals(callbackData.getResultCode())) {
                updateAppointmentPaymentStatus(payment.getAppointment(), true);
            }

            return true;

        } catch (Exception e) {
            log.error("Error handling Momo callback: ", e);
            return false;
        }
    }

    @Override
    public boolean handleVNPayCallback(PaymentCallbackDTO callbackData) {
        try {
            log.info("Handling VNPay callback for order: {}", callbackData.getOrderId());

            // Verify signature
            if (!verifyVNPaySignature(callbackData)) {
                log.error("Invalid VNPay signature for order: {}", callbackData.getOrderId());
                return false;
            }

            // Tìm payment
            Payment payment = paymentRepository.findByOrderId(callbackData.getVnp_TxnRef())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

            // Cập nhật payment status
            updatePaymentFromVNPayCallback(payment, callbackData);
            
            // Cập nhật appointment nếu thanh toán thành công
            if ("00".equals(callbackData.getVnp_ResponseCode())) {
                updateAppointmentPaymentStatus(payment.getAppointment(), true);
            }

            return true;

        } catch (Exception e) {
            log.error("Error handling VNPay callback: ", e);
            return false;
        }
    }

    @Override
    public PaymentResponseDTO queryMomoPaymentStatus(String orderId) {
        try {
            log.info("Querying Momo payment status for order: {}", orderId);

            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

            // Chuẩn bị request query
            Map<String, String> queryParams = new HashMap<>();
            queryParams.put("partnerCode", paymentConfig.getMomo().getPartnerCode());
            queryParams.put("requestId", PaymentUtils.generateRequestId());
            queryParams.put("orderId", orderId);
            queryParams.put("lang", "vi");

            // Tạo signature
            String rawSignature = "accessKey=" + paymentConfig.getMomo().getAccessKey() +
                                "&orderId=" + orderId +
                                "&partnerCode=" + paymentConfig.getMomo().getPartnerCode() +
                                "&requestId=" + queryParams.get("requestId");
            
            String signature = PaymentUtils.createMomoSignature(rawSignature, paymentConfig.getMomo().getSecretKey());
            queryParams.put("signature", signature);
            queryParams.put("accessKey", paymentConfig.getMomo().getAccessKey());

            // Gọi API query
            String queryEndpoint = paymentConfig.getMomo().getEndpoint() + paymentConfig.getMomo().getQueryStatusUrl();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(queryParams, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(queryEndpoint, entity, String.class);

            // Parse và return response
            Map<String, Object> momoResponse = objectMapper.readValue(response.getBody(), Map.class);
            
            return PaymentResponseDTO.builder()
                    .orderId(orderId)
                    .status(payment.getStatus().toString())
                    .gatewayResponse(response.getBody())
                    .provider("MOMO")
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Error querying Momo payment status: ", e);
            return PaymentResponseDTO.builder()
                    .success(false)
                    .errorMessage("Lỗi truy vấn trạng thái Momo: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public PaymentResponseDTO queryVNPayPaymentStatus(String orderId) {
        try {
            log.info("Querying VNPay payment status for order: {}", orderId);

            Payment payment = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

            // VNPay query thường được thực hiện thông qua callback
            // Ở đây chúng ta trả về trạng thái từ database
            
            return PaymentResponseDTO.builder()
                    .orderId(orderId)
                    .status(payment.getStatus().toString())
                    .amount(payment.getAmount())
                    .provider("VNPAY")
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Error querying VNPay payment status: ", e);
            return PaymentResponseDTO.builder()
                    .success(false)
                    .errorMessage("Lỗi truy vấn trạng thái VNPay: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public boolean verifySignature(String data, String signature, String provider) {
        try {
            switch (provider.toUpperCase()) {
                case "MOMO":
                    String momoSignature = PaymentUtils.createMomoSignature(data, paymentConfig.getMomo().getSecretKey());
                    return signature.equals(momoSignature);
                case "VNPAY":
                    String vnpaySignature = PaymentUtils.createVNPaySignature(data, paymentConfig.getVnpay().getHashSecret());
                    return signature.equals(vnpaySignature);
                default:
                    return false;
            }
        } catch (Exception e) {
            log.error("Error verifying signature: ", e);
            return false;
        }
    }

    // Helper methods
    private Map<String, String> buildMomoRequest(PaymentRequestDTO request, String orderId, String requestId) {
        Map<String, String> params = new HashMap<>();
        params.put("partnerCode", paymentConfig.getMomo().getPartnerCode());
        params.put("partnerName", "Hệ thống Đặt lịch Y tế");
        params.put("storeId", "MomoTestStore");
        params.put("requestId", requestId);
        params.put("amount", PaymentUtils.formatAmount(request.getAmount()));
        params.put("orderId", orderId);
        params.put("orderInfo", request.getDescription());
        params.put("redirectUrl", request.getReturnUrl() != null ? request.getReturnUrl() : paymentConfig.getMomo().getReturnUrl());
        params.put("ipnUrl", paymentConfig.getMomo().getNotifyUrl());
        params.put("lang", "vi");
        params.put("extraData", "");
        params.put("requestType", "payWithMethod");
        params.put("signature", ""); // Sẽ được set sau
        
        return params;
    }

    private String buildMomoRawSignature(Map<String, String> params) {
        return "accessKey=" + paymentConfig.getMomo().getAccessKey() +
               "&amount=" + params.get("amount") +
               "&extraData=" + params.get("extraData") +
               "&ipnUrl=" + params.get("ipnUrl") +
               "&orderId=" + params.get("orderId") +
               "&orderInfo=" + params.get("orderInfo") +
               "&partnerCode=" + params.get("partnerCode") +
               "&redirectUrl=" + params.get("redirectUrl") +
               "&requestId=" + params.get("requestId") +
               "&requestType=" + params.get("requestType");
    }

    private Map<String, String> buildVNPayRequest(PaymentRequestDTO request, String orderId) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", paymentConfig.getVnpay().getVersion());
        params.put("vnp_Command", paymentConfig.getVnpay().getCommand());
        params.put("vnp_TmnCode", paymentConfig.getVnpay().getTmnCode());
        params.put("vnp_Amount", String.valueOf(Math.round(request.getAmount() * 100))); // VNPay yêu cầu x100
        params.put("vnp_CurrCode", paymentConfig.getVnpay().getCurrCode());
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", request.getDescription());
        params.put("vnp_OrderType", paymentConfig.getVnpay().getOrderType());
        params.put("vnp_Locale", paymentConfig.getVnpay().getLocale());
        params.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : paymentConfig.getVnpay().getReturnUrl());
        params.put("vnp_IpAddr", request.getClientIp());
        params.put("vnp_CreateDate", PaymentUtils.formatDateTime(LocalDateTime.now(), "yyyyMMddHHmmss"));
        
        return params;
    }

    private PaymentResponseDTO processMomoResponse(Map<String, Object> momoResponse, Payment payment, PaymentRequestDTO request) {
        String resultCode = String.valueOf(momoResponse.get("resultCode"));
        
        if ("0".equals(resultCode)) {
            // Thành công
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setPaymentUrl(String.valueOf(momoResponse.get("payUrl")));
            payment.setGatewayOrderId(String.valueOf(momoResponse.get("orderId")));
            
            String qrCodeUrl = String.valueOf(momoResponse.get("qrCodeUrl"));
            String deepLink = buildMomoDeepLink(request.getDeviceType(), payment.getOrderId());
            
            return PaymentResponseDTO.builder()
                    .success(true)
                    .orderId(payment.getOrderId())
                    .amount(request.getAmount())
                    .currency("VND")
                    .paymentUrl(payment.getPaymentUrl())
                    .qrCode(qrCodeUrl)
                    .deepLink(deepLink)
                    .status("PENDING")
                    .message("Tạo thanh toán Momo thành công")
                    .provider("MOMO")
                    .gatewayOrderId(payment.getGatewayOrderId())
                    .createdAt(payment.getCreatedAt())
                    .build();
        } else {
            // Thất bại
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setErrorCode(resultCode);
            payment.setErrorMessage(String.valueOf(momoResponse.get("message")));
            
            return PaymentResponseDTO.builder()
                    .success(false)
                    .errorCode(resultCode)
                    .errorMessage(String.valueOf(momoResponse.get("message")))
                    .provider("MOMO")
                    .build();
        }
    }

    private String buildMomoDeepLink(String deviceType, String orderId) {
        if (!"MOBILE_IOS".equals(deviceType) && !"MOBILE_ANDROID".equals(deviceType)) {
            return null;
        }
        
        String scheme = "MOBILE_IOS".equals(deviceType) ? 
                       paymentConfig.getMomo().getIosScheme() : 
                       paymentConfig.getMomo().getAndroidScheme();
        
        Map<String, String> params = new HashMap<>();
        params.put("orderId", orderId);
        params.put("action", "payment");
        
        return PaymentUtils.buildDeepLink(scheme, "payment", params);
    }

    private String buildVNPayDeepLink(String deviceType, Map<String, String> vnpayParams) {
        if (!"MOBILE_IOS".equals(deviceType) && !"MOBILE_ANDROID".equals(deviceType)) {
            return null;
        }
        
        String scheme = "MOBILE_IOS".equals(deviceType) ? 
                       paymentConfig.getVnpay().getIosScheme() : 
                       paymentConfig.getVnpay().getAndroidScheme();
        
        return PaymentUtils.buildDeepLink(scheme, "payment", vnpayParams);
    }

    private boolean verifyMomoSignature(PaymentCallbackDTO callbackData) {
        // Implement Momo signature verification
        String rawSignature = "accessKey=" + callbackData.getAccessKey() +
                             "&amount=" + callbackData.getAmount() +
                             "&extraData=" + callbackData.getExtraData() +
                             "&message=" + callbackData.getMessage() +
                             "&orderId=" + callbackData.getOrderId() +
                             "&orderInfo=" + callbackData.getOrderInfo() +
                             "&orderType=" + callbackData.getOrderType() +
                             "&partnerCode=" + callbackData.getPartnerCode() +
                             "&payType=web" +
                             "&requestId=" + callbackData.getRequestId() +
                             "&responseTime=" + callbackData.getPayTime() +
                             "&resultCode=" + callbackData.getResultCode() +
                             "&transId=" + callbackData.getTransactionId();
        
        String expectedSignature = PaymentUtils.createMomoSignature(rawSignature, paymentConfig.getMomo().getSecretKey());
        return callbackData.getSignature().equals(expectedSignature);
    }

    private boolean verifyVNPaySignature(PaymentCallbackDTO callbackData) {
        // Build hash data từ callback parameters, loại bỏ vnp_SecureHash
        String hashData = PaymentUtils.buildHashData(callbackData.getRawData(), "vnp_SecureHash");
        String expectedSignature = PaymentUtils.createVNPaySignature(hashData, paymentConfig.getVnpay().getHashSecret());
        return callbackData.getSecureHash().equals(expectedSignature);
    }

    private void updatePaymentFromMomoCallback(Payment payment, PaymentCallbackDTO callbackData) {
        if ("0".equals(callbackData.getResultCode())) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        
        payment.setGatewayTransactionId(callbackData.getTransactionId());
        payment.setCallbackData(callbackData.toString());
        payment.setErrorCode(callbackData.getResultCode());
        payment.setErrorMessage(callbackData.getMessage());
        
        paymentRepository.save(payment);
    }

    private void updatePaymentFromVNPayCallback(Payment payment, PaymentCallbackDTO callbackData) {
        if ("00".equals(callbackData.getVnp_ResponseCode())) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        
        payment.setGatewayTransactionId(callbackData.getVnp_TransactionNo());
        payment.setCallbackData(callbackData.toString());
        payment.setErrorCode(callbackData.getVnp_ResponseCode());
        
        paymentRepository.save(payment);
    }

    private void updateAppointmentPaymentStatus(Appointment appointment, boolean isPaid) {
        appointment.setDepositPaid(isPaid);
        if (isPaid) {
            appointment.setPaymentStatusMomo(Appointment.PaymentStatus.SUCCESS);
        }
        appointmentRepository.save(appointment);
    }
} 
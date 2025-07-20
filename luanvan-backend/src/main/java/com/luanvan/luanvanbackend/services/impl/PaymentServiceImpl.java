package com.luanvan.luanvanbackend.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luanvan.luanvanbackend.config.PaymentConfig;
import com.luanvan.luanvanbackend.dto.*;
import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.Payment;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.PaymentRepository;
import com.luanvan.luanvanbackend.repositories.SystemConfigurationRepository;
import com.luanvan.luanvanbackend.services.PaymentService;
import com.luanvan.luanvanbackend.services.EmailService;
import com.luanvan.luanvanbackend.utils.PaymentUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.luanvan.luanvanbackend.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.lang.StringBuilder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import com.luanvan.luanvanbackend.dto.AppointmentDTO;


@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    // Explicit logger declaration for Docker compatibility
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final SystemConfigurationRepository systemConfigurationRepository; // Thêm repo
    private final PaymentConfig paymentConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    // Helper method to get the current system configuration
    private SystemConfiguration getSystemConfiguration() {
        // Lấy cấu hình đầu tiên tìm thấy, hoặc ném lỗi nếu không có
        return systemConfigurationRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("System configuration not found. Please configure the system first."));
    }

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
    public PaymentResponseDTO createVNPayPayment(PaymentRequestDTO request) throws Exception {
            log.info("Creating VNPay payment for appointment: {}", request.getAppointmentId());

        // 1. Lấy cấu hình từ database
        SystemConfiguration systemConfig = systemConfigurationRepository.findFirstByOrderByConfigIdAsc();
        if (systemConfig == null) {
            throw new ResourceNotFoundException("System configuration not found.");
        }
        String tmnCode = systemConfig.getVnpayTmnCode();
        String hashSecret = systemConfig.getVnpaySecretKey();

        // 2. Lấy thông tin lịch hẹn
            Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + request.getAppointmentId()));

        // 3. Chuẩn bị các tham số cho VNPay
            String orderId = PaymentUtils.generateOrderId("VNPAY");
        String clientIp = request.getClientIp();
        String returnUrl = request.getReturnUrl();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", paymentConfig.getVnpay().getVersion());
        vnp_Params.put("vnp_Command", paymentConfig.getVnpay().getCommand());
        vnp_Params.put("vnp_TmnCode", tmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(appointment.getDepositAmount().longValue() * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderId);
        
        // Làm sạch vnp_OrderInfo để tránh lỗi chữ ký
        String orderInfo = request.getDescription().replaceAll("[^a-zA-Z0-9\\s]", "");
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        
        vnp_Params.put("vnp_OrderType", paymentConfig.getVnpay().getOrderType());
        vnp_Params.put("vnp_Locale", paymentConfig.getVnpay().getLocale());
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_IpAddr", clientIp);

        LocalDateTime now = LocalDateTime.now();
        vnp_Params.put("vnp_CreateDate", PaymentUtils.formatDateTime(now, "yyyyMMddHHmmss"));

        LocalDateTime expireDate = now.plusMinutes(paymentConfig.getCommon().getPaymentTimeout());
        vnp_Params.put("vnp_ExpireDate", PaymentUtils.formatDateTime(expireDate, "yyyyMMddHHmmss"));
        
        // 4. Tạo chữ ký (Hash)
        // Dữ liệu để hash phải được sắp xếp theo tên và giá trị phải được URL-encode.
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashDataBuilder = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashDataBuilder.append(fieldName);
                hashDataBuilder.append('=');
                hashDataBuilder.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                if (itr.hasNext()) {
                    hashDataBuilder.append('&');
                }
            }
        }
        String hashData = hashDataBuilder.toString();
        log.info("FINAL VNPay Raw HashData for signing: [{}]", hashData);
        String vnp_SecureHash = PaymentUtils.createVNPaySignature(hashData, hashSecret);
        
        // Thêm chữ ký vào map để tạo URL cuối cùng
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);

        // 5. Tạo URL thanh toán (đã mã hóa các tham số)
        String queryUrl = vnp_Params.entrySet().stream()
                .map(entry -> {
                    try {
                        return entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString());
                    } catch (UnsupportedEncodingException e) {
                        // This should not happen with UTF-8, so we throw a runtime exception
                        throw new RuntimeException(e);
                    }
                })
                .reduce((p1, p2) -> p1 + "&" + p2)
                .orElse("");

        String paymentUrl = paymentConfig.getVnpay().getEndpoint() + paymentConfig.getVnpay().getPayUrl() + "?" + queryUrl;
        log.info("Constructed VNPay URL: {}", paymentUrl);

        // 6. Lưu thông tin giao dịch vào DB
            Payment payment = new Payment();
        payment.setOrderId(orderId);
            payment.setAppointment(appointment);
            payment.setProvider(Payment.PaymentProvider.VNPAY);
        payment.setAmount(appointment.getDepositAmount().doubleValue());
            payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCreatedAt(now);
        payment.setExpiredAt(expireDate);
        payment.setClientIp(clientIp);
        payment.setPaymentUrl(paymentUrl);
        payment.setReturnUrl(returnUrl); // Lưu URL gốc, chưa mã hóa
            payment.setDescription(request.getDescription());
        paymentRepository.save(payment);

        // 7. Trả về response cho Frontend
        PaymentResponseDTO responseDTO = new PaymentResponseDTO();
        responseDTO.setSuccess(true);
        responseDTO.setMessage("VNPay payment URL created successfully.");
        responseDTO.setProvider("VNPAY");
        responseDTO.setOrderId(orderId);
        responseDTO.setAmount(appointment.getDepositAmount().doubleValue());
        responseDTO.setCurrency("VND");
        responseDTO.setPaymentUrl(paymentUrl);
        responseDTO.setStatus(Payment.PaymentStatus.PENDING.name());
        responseDTO.setCreatedAt(now);
        responseDTO.setExpiredAt(expireDate);

        return responseDTO;
    }

    @Override
    @Transactional
    public AppointmentDTO handleVNPayReturn(Map<String, String> vnp_params) {
        // Lấy secret key từ DB
        SystemConfiguration systemConfig = getSystemConfiguration();
        String hashSecret = systemConfig.getVnpaySecretKey();

        // 1. Xác thực chữ ký
        String vnp_SecureHash = vnp_params.get("vnp_SecureHash");
        // Loại bỏ vnp_SecureHash và vnp_SecureHashType khỏi map để tạo lại chuỗi hash
        vnp_params.remove("vnp_SecureHash");
        vnp_params.remove("vnp_SecureHashType");

        String hashData = PaymentUtils.buildHashData(vnp_params);
        String calculatedSignature = PaymentUtils.createVNPaySignature(hashData, hashSecret);

        if (!calculatedSignature.equals(vnp_SecureHash)) {
            throw new RuntimeException("VNPay signature validation failed.");
        }

        // 2. Kiểm tra kết quả giao dịch
        String vnp_ResponseCode = vnp_params.get("vnp_ResponseCode");
        String vnp_TxnRef = vnp_params.get("vnp_TxnRef"); // Đây là orderId của chúng ta

        Payment payment = paymentRepository.findByOrderId(vnp_TxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with orderId: " + vnp_TxnRef));

        // Lấy thông tin cuộc hẹn từ thanh toán
        Appointment appointment = payment.getAppointment();
        if (appointment == null) {
            throw new ResourceNotFoundException("Appointment not found for this payment.");
        }

        // Chỉ xử lý nếu thanh toán đang ở trạng thái PENDING
        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            log.warn("Payment with orderId {} already processed. Current status: {}", vnp_TxnRef, payment.getStatus());
            // Trả về thông tin lịch hẹn hiện tại mà không xử lý lại
            return convertAppointmentToDTO(appointment);
        }

        if ("00".equals(vnp_ResponseCode)) {
            // Cập nhật trạng thái thanh toán và cuộc hẹn
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setGatewayTransactionId(vnp_params.get("vnp_TransactionNo"));
            payment.setPaidAt(LocalDateTime.now());
            payment.setCallbackData(vnp_params.toString());
            payment.setErrorCode(vnp_ResponseCode);

            appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            appointment.setDepositPaid(true);

            // Gửi email xác nhận
            emailService.sendAppointmentConfirmationEmail(appointment);

        } else {
            // Cập nhật trạng thái cuộc hẹn là thanh toán thất bại
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setErrorCode(vnp_ResponseCode);
            payment.setCallbackData(vnp_params.toString());
            appointment.setStatus(Appointment.AppointmentStatus.PAYMENT_FAILED);
            
            // Gửi email thông báo hủy/thất bại
            emailService.sendAppointmentCancellationEmail(appointment, "Thanh toán không thành công qua VNPay.");
        }
        
        paymentRepository.save(payment);
        appointmentRepository.save(appointment);
        
        return convertAppointmentToDTO(appointment);
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
            SystemConfiguration systemConfig = getSystemConfiguration();
            switch (provider.toUpperCase()) {
                case "MOMO":
                    // Momo config can also be moved to DB if needed in the future
                    String momoSignature = PaymentUtils.createMomoSignature(data, paymentConfig.getMomo().getSecretKey());
                    return signature.equals(momoSignature);
                case "VNPAY":
                    String vnpaySignature = PaymentUtils.createVNPaySignature(data, systemConfig.getVnpaySecretKey());
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

    private Map<String, String> buildVNPayRequest(PaymentRequestDTO request, String orderId, SystemConfiguration systemConfig) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", paymentConfig.getVnpay().getVersion());
        params.put("vnp_Command", paymentConfig.getVnpay().getCommand());
        params.put("vnp_TmnCode", systemConfig.getVnpayTmnCode()); // Sử dụng TmnCode từ DB
        params.put("vnp_Amount", String.valueOf(Math.round(request.getAmount() * 100))); // VNPay yêu cầu x100
        params.put("vnp_CurrCode", paymentConfig.getVnpay().getCurrCode());
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", request.getDescription());
        params.put("vnp_OrderType", paymentConfig.getVnpay().getOrderType());
        params.put("vnp_Locale", paymentConfig.getVnpay().getLocale());
        params.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : paymentConfig.getVnpay().getReturnUrl());
        params.put("vnp_IpAddr", request.getClientIp());
        LocalDateTime now = LocalDateTime.now();
        params.put("vnp_CreateDate", PaymentUtils.formatDateTime(now, "yyyyMMddHHmmss"));
        
        return params;
    }

    @SuppressWarnings("unchecked")
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
        try {
            // Lấy secret key từ config (có thể chuyển vào DB trong tương lai nếu cần)
            String secretKey = paymentConfig.getMomo().getSecretKey();
            
            // Xây dựng chuỗi raw hash từ các tham số mà Momo gửi về
            // Thứ tự các trường phải chính xác như trong tài liệu của Momo
            String rawHash = "accessKey=" + paymentConfig.getMomo().getAccessKey() +
                           "&amount=" + callbackData.getAmount().longValue() +
                             "&extraData=" + callbackData.getExtraData() +
                             "&message=" + callbackData.getMessage() +
                             "&orderId=" + callbackData.getOrderId() +
                             "&orderInfo=" + callbackData.getOrderInfo() +
                             "&orderType=" + callbackData.getOrderType() +
                             "&partnerCode=" + callbackData.getPartnerCode() +
                           "&payType=" + callbackData.getRawData().get("payType") + // Lấy từ raw data
                             "&requestId=" + callbackData.getRequestId() +
                           "&responseTime=" + callbackData.getRawData().get("responseTime") + // Lấy từ raw data
                             "&resultCode=" + callbackData.getResultCode() +
                             "&transId=" + callbackData.getTransactionId();
        
            String calculatedSignature = PaymentUtils.createMomoSignature(rawHash, secretKey);
            
            return callbackData.getSignature().equals(calculatedSignature);
            
        } catch (Exception e) {
            log.error("Error verifying Momo signature: ", e);
            return false;
        }
    }

    private boolean verifyVNPaySignature(PaymentCallbackDTO callbackData) {
        try {
            SystemConfiguration systemConfig = getSystemConfiguration();
            String secretKey = systemConfig.getVnpaySecretKey();
            if (secretKey == null || secretKey.isEmpty()) {
                log.error("VNPay secret key is not configured in the database.");
                return false;
            }
            String secureHash = callbackData.getSecureHash();
        String hashData = PaymentUtils.buildHashData(callbackData.getRawData(), "vnp_SecureHash");
            String calculatedSignature = PaymentUtils.createVNPaySignature(hashData, secretKey);
            return secureHash.equals(calculatedSignature);
        } catch (Exception e) {
            log.error("Error verifying VNPay signature: ", e);
            return false;
        }
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

    private String hashAllFields(Map<String, String> fields, String secretKey) {
        // ... existing code ...
        return PaymentUtils.createVNPaySignature(PaymentUtils.buildHashData(fields), secretKey); // Sử dụng lại logic hash đã có
    }

    private AppointmentDTO convertAppointmentToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getAppointmentId())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getUserId() : null)
                .patientName(appointment.getPatient() != null ? appointment.getPatient().getFullName() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getUserId() : null)
                .doctorName(appointment.getDoctor() != null ? appointment.getDoctor().getFullName() : null)
                .clinicId(appointment.getClinic() != null ? appointment.getClinic().getClinicId() : null)
                .clinicName(appointment.getClinic() != null ? appointment.getClinic().getName() : null)
                .clinicAddress(appointment.getClinic() != null ? appointment.getClinic().getAddress() : null)
                .specialtyId(appointment.getSpecialty() != null ? appointment.getSpecialty().getSpecialtyId() : null)
                .specialtyName(appointment.getSpecialty() != null ? appointment.getSpecialty().getName() : null)
                .appointmentDateTime(appointment.getAppointmentDateTime())
                .reasonForVisit(appointment.getReasonForVisit())
                .status(appointment.getStatus().name())
                .isDepositPaid(appointment.isDepositPaid())
                .build();
    }
}
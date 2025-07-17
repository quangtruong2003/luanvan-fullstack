package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.*;
import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.services.PaymentService;
import com.luanvan.luanvanbackend.dto.AppointmentDTO;
import com.luanvan.luanvanbackend.utils.PaymentUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Controller", description = "APIs quản lý thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Tạo thanh toán Momo", description = "Tạo link thanh toán với Momo")
    @PostMapping("/momo/create")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> createMomoPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            HttpServletRequest httpRequest) {
        
        // Tự động detect device type và IP
        String userAgent = httpRequest.getHeader("User-Agent");
        String clientIp = getClientIpAddress(httpRequest);
        
        request.setUserAgent(userAgent);
        request.setClientIp(clientIp);
        request.setDeviceType(PaymentUtils.detectDeviceType(userAgent));
        request.setPaymentProvider("MOMO");

        log.info("Creating Momo payment for appointment: {} from IP: {}", 
                request.getAppointmentId(), clientIp);

        PaymentResponseDTO response = paymentService.createMomoPayment(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @Operation(summary = "Tạo thanh toán VNPay", description = "Tạo link thanh toán với VNPay")
    @PostMapping("/vnpay/create")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> createVNPayPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            HttpServletRequest httpServletRequest) {
        
        try {
            // Chuẩn hóa IP address
            String clientIp = httpServletRequest.getRemoteAddr();
            if (clientIp == null || clientIp.equals("0:0:0:0:0:0:0:1")) {
                clientIp = "127.0.0.1";
            }
            request.setClientIp(clientIp);
            log.info("Creating VNPay payment for appointment: {} from IP: {}", request.getAppointmentId(), clientIp);

            PaymentResponseDTO response = paymentService.createVNPayPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating VNPay payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponseDTO.builder().success(false).errorMessage(e.getMessage()).build());
        }
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> handleVNPayCallback(@RequestParam Map<String, String> vnp_params) {
        try {
            log.info("Received VNPay callback with params: {}", vnp_params);
            AppointmentDTO updatedAppointmentDTO = paymentService.handleVNPayReturn(vnp_params);
            return ResponseEntity.ok(updatedAppointmentDTO);
        } catch (Exception e) {
            log.error("Error handling VNPay callback: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error processing VNPay return: " + e.getMessage());
        }
    }

    @Operation(summary = "Callback từ Momo", description = "Xử lý IPN từ Momo")
    @PostMapping("/momo/notify")
    public ResponseEntity<Map<String, Object>> handleMomoCallback(
            @RequestBody Map<String, String> callbackParams,
            HttpServletRequest request) {
        
        log.info("Received Momo callback: {}", callbackParams);

        try {
            // Parse callback data
            PaymentCallbackDTO callbackData = parseMomoCallback(callbackParams);
            
            // Xử lý callback
            boolean success = paymentService.handleMomoCallback(callbackData);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("resultCode", 0);
                response.put("message", "Xử lý thành công");
            } else {
                response.put("resultCode", -1);
                response.put("message", "Xử lý thất bại");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error handling Momo callback: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", -1);
            response.put("message", "Lỗi xử lý callback: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @Operation(summary = "Callback từ VNPay", description = "Xử lý IPN từ VNPay")
    @PostMapping("/vnpay/notify")
    public ResponseEntity<Map<String, Object>> handleVNPayCallback(
            @RequestParam Map<String, String> callbackParams,
            HttpServletRequest request) {
        
        log.info("Received VNPay callback: {}", callbackParams);

        try {
            // Parse callback data
            PaymentCallbackDTO callbackData = parseVNPayCallback(callbackParams);
            
            // Xử lý callback
            boolean success = paymentService.handleVNPayCallback(callbackData);
            
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                response.put("RspCode", "97");
                response.put("Message", "Confirm Fail");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error handling VNPay callback: ", e);
            Map<String, Object> response = new HashMap<>();
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
            return ResponseEntity.ok(response);
        }
    }

    @Operation(summary = "Return URL từ Momo", description = "Xử lý redirect từ Momo sau thanh toán")
    @GetMapping("/momo/return")
    public ResponseEntity<String> handleMomoReturn(
            @RequestParam Map<String, String> params) {
        
        log.info("Momo return params: {}", params);
        
        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");
        
        if ("0".equals(resultCode)) {
            return ResponseEntity.ok(buildSuccessPage("Momo", orderId, "Thanh toán thành công"));
        } else {
            return ResponseEntity.ok(buildFailurePage("Momo", orderId, "Thanh toán thất bại"));
        }
    }

    @Operation(summary = "Return URL từ VNPay", description = "Xử lý redirect từ VNPay sau thanh toán")
    @GetMapping("/vnpay/return")
    public ResponseEntity<String> handleVNPayReturn(
            @RequestParam Map<String, String> params) {
        
        log.info("VNPay return params: {}", params);
        
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok(buildSuccessPage("VNPay", txnRef, "Thanh toán thành công"));
        } else {
            return ResponseEntity.ok(buildFailurePage("VNPay", txnRef, "Thanh toán thất bại"));
        }
    }

    @Operation(summary = "Truy vấn trạng thái thanh toán Momo")
    @GetMapping("/momo/status/{orderId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> queryMomoStatus(
            @Parameter(description = "ID đơn hàng") @PathVariable String orderId) {
        
        PaymentResponseDTO response = paymentService.queryMomoPaymentStatus(orderId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Truy vấn trạng thái thanh toán VNPay")
    @GetMapping("/vnpay/status/{orderId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> queryVNPayStatus(
            @Parameter(description = "ID đơn hàng") @PathVariable String orderId) {
        
        PaymentResponseDTO response = paymentService.queryVNPayPaymentStatus(orderId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Tạo thanh toán tự động (chọn gateway phù hợp)")
    @PostMapping("/create")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @Valid @RequestBody PaymentRequestDTO request,
            HttpServletRequest httpRequest) {
        
        // Tự động detect device và setup
        String userAgent = httpRequest.getHeader("User-Agent");
        String clientIp = getClientIpAddress(httpRequest);
        String deviceType = PaymentUtils.detectDeviceType(userAgent);
        
        request.setUserAgent(userAgent);
        request.setClientIp(clientIp);
        request.setDeviceType(deviceType);

        // Logic chọn gateway dựa trên device type
        String provider = request.getPaymentProvider();
        if (provider == null || provider.isEmpty()) {
            // Auto-select based on device
            if ("MOBILE_IOS".equals(deviceType) || "MOBILE_ANDROID".equals(deviceType)) {
                provider = "MOMO"; // Momo tốt hơn cho mobile
            } else {
                provider = "VNPAY"; // VNPay tốt cho web
            }
            request.setPaymentProvider(provider);
        }

        log.info("Creating {} payment for appointment: {} from device: {}", 
                provider, request.getAppointmentId(), deviceType);

        try {
            PaymentResponseDTO response;
            if ("MOMO".equalsIgnoreCase(provider)) {
                response = paymentService.createMomoPayment(request);
            } else if ("VNPAY".equalsIgnoreCase(provider)) {
                response = paymentService.createVNPayPayment(request);
            } else {
                response = PaymentResponseDTO.builder()
                        .success(false)
                        .errorCode("INVALID_PROVIDER")
                        .errorMessage("Provider không hợp lệ: " + provider)
                        .build();
            }
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("Error creating payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponseDTO.builder()
                        .success(false)
                        .errorCode("PAYMENT_CREATION_FAILED")
                        .errorMessage(e.getMessage())
                        .build());
        }
    }

    // Helper methods
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
            if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
                ipAddress = "127.0.0.1";
            }
        }
        
        // "123.123.123.123, 456.456.456.456"
        if (ipAddress != null && ipAddress.contains(",")) {
            return ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }

    private PaymentCallbackDTO parseMomoCallback(Map<String, String> params) {
        PaymentCallbackDTO callbackData = new PaymentCallbackDTO();
        callbackData.setOrderId(params.get("orderId"));
        callbackData.setTransactionId(params.get("transId"));
        callbackData.setAmount(PaymentUtils.parseAmount(params.get("amount")));
        callbackData.setResultCode(params.get("resultCode"));
        callbackData.setMessage(params.get("message"));
        callbackData.setPayTime(params.get("responseTime"));
        callbackData.setSignature(params.get("signature"));
        callbackData.setProvider("MOMO");
        callbackData.setRawData(params);
        
        // Momo specific fields
        callbackData.setPartnerCode(params.get("partnerCode"));
        callbackData.setAccessKey(params.get("accessKey"));
        callbackData.setRequestId(params.get("requestId"));
        callbackData.setOrderInfo(params.get("orderInfo"));
        callbackData.setOrderType(params.get("orderType"));
        callbackData.setExtraData(params.get("extraData"));
        
        return callbackData;
    }

    private PaymentCallbackDTO parseVNPayCallback(Map<String, String> params) {
        PaymentCallbackDTO callbackData = new PaymentCallbackDTO();
        callbackData.setOrderId(params.get("vnp_TxnRef"));
        callbackData.setTransactionId(params.get("vnp_TransactionNo"));
        callbackData.setAmount(PaymentUtils.parseAmount(params.get("vnp_Amount")) / 100); // VNPay x100
        callbackData.setResultCode(params.get("vnp_ResponseCode"));
        callbackData.setPayTime(params.get("vnp_PayDate"));
        callbackData.setSecureHash(params.get("vnp_SecureHash"));
        callbackData.setProvider("VNPAY");
        callbackData.setRawData(params);
        
        // VNPay specific fields
        callbackData.setVnp_TmnCode(params.get("vnp_TmnCode"));
        callbackData.setVnp_TxnRef(params.get("vnp_TxnRef"));
        callbackData.setVnp_ResponseCode(params.get("vnp_ResponseCode"));
        callbackData.setVnp_TransactionNo(params.get("vnp_TransactionNo"));
        callbackData.setVnp_BankCode(params.get("vnp_BankCode"));
        callbackData.setVnp_PayDate(params.get("vnp_PayDate"));
        callbackData.setVnp_OrderInfo(params.get("vnp_OrderInfo"));
        
        return callbackData;
    }

    private String buildSuccessPage(String provider, String orderId, String message) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Thanh toán thành công</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                    .success { color: #28a745; }
                    .container { max-width: 500px; margin: 0 auto; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="success">✅ %s</h1>
                    <p>Provider: <strong>%s</strong></p>
                    <p>Mã đơn hàng: <strong>%s</strong></p>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                    <button onclick="window.close()">Đóng cửa sổ</button>
                </div>
            </body>
            </html>
            """, message, provider, orderId);
    }

    private String buildFailurePage(String provider, String orderId, String message) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Thanh toán thất bại</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                    .error { color: #dc3545; }
                    .container { max-width: 500px; margin: 0 auto; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">❌ %s</h1>
                    <p>Provider: <strong>%s</strong></p>
                    <p>Mã đơn hàng: <strong>%s</strong></p>
                    <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                    <button onclick="window.close()">Đóng cửa sổ</button>
                </div>
            </body>
            </html>
            """, message, provider, orderId);
    }
} 
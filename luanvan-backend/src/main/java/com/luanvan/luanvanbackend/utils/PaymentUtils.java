package com.luanvan.luanvanbackend.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@Slf4j
public class PaymentUtils {
    
    /**
     * Tạo HMAC SHA256 signature cho Momo
     */
    public static String createMomoSignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            log.error("Error creating Momo signature: ", e);
            return null;
        }
    }
    
    /**
     * Tạo HMAC SHA512 signature cho VNPay
     */
    public static String createVNPaySignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (Exception e) {
            log.error("Error creating VNPay signature: ", e);
            return null;
        }
    }
    
    /**
     * Tạo MD5 hash
     */
    public static String createMD5Hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            log.error("Error creating MD5 hash: ", e);
            return null;
        }
    }
    
    /**
     * Convert byte array to hex string
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    
    /**
     * Tạo unique order ID
     */
    public static String generateOrderId(String prefix) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf(new Random().nextInt(10000));
        return String.format("%s_%s_%s", prefix, timestamp, random);
    }
    
    /**
     * Tạo unique request ID
     */
    public static String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * Format amount để gửi cho payment gateway (loại bỏ số thập phân)
     */
    public static String formatAmount(Double amount) {
        return String.valueOf(Math.round(amount));
    }
    
    /**
     * Parse amount từ string về double
     */
    public static Double parseAmount(String amountStr) {
        try {
            return Double.parseDouble(amountStr);
        } catch (NumberFormatException e) {
            log.error("Error parsing amount: {}", amountStr, e);
            return 0.0;
        }
    }
    
    /**
     * URL encode string
     */
    public static String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            log.error("Error URL encoding: ", e);
            return value;
        }
    }
    
    /**
     * Tạo query string từ map parameters
     */
    public static String buildQueryString(Map<String, String> params) {
        StringBuilder queryString = new StringBuilder();
        
        // Sort parameters by key
        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        
        boolean first = true;
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (!first) {
                    queryString.append("&");
                }
                queryString.append(entry.getKey())
                          .append("=")
                          .append(urlEncode(entry.getValue()));
                first = false;
            }
        }
        
        return queryString.toString();
    }
    
    /**
     * Tạo hash data cho signature (không include hash field)
     */
    public static String buildHashData(Map<String, String> params, String... excludeFields) {
        Set<String> excludeSet = new HashSet<>(Arrays.asList(excludeFields));
        
        TreeMap<String, String> sortedParams = new TreeMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!excludeSet.contains(entry.getKey()) && 
                entry.getValue() != null && 
                !entry.getValue().isEmpty()) {
                sortedParams.put(entry.getKey(), entry.getValue());
            }
        }
        
        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (!first) {
                hashData.append("&");
            }
            hashData.append(entry.getKey())
                   .append("=")
                   .append(entry.getValue());
            first = false;
        }
        
        return hashData.toString();
    }
    
    /**
     * Kiểm tra device type từ User-Agent
     */
    public static String detectDeviceType(String userAgent) {
        if (userAgent == null) {
            return "WEB";
        }
        
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.contains("iphone") || userAgent.contains("ipad")) {
            return "MOBILE_IOS";
        } else if (userAgent.contains("android")) {
            return "MOBILE_ANDROID";
        } else {
            return "WEB";
        }
    }
    
    /**
     * Tạo deep link URL dựa trên device type
     */
    public static String buildDeepLink(String baseScheme, String action, Map<String, String> params) {
        StringBuilder deepLink = new StringBuilder(baseScheme);
        deepLink.append(action);
        
        if (params != null && !params.isEmpty()) {
            deepLink.append("?");
            deepLink.append(buildQueryString(params));
        }
        
        return deepLink.toString();
    }
    
    /**
     * Kiểm tra timeout của payment
     */
    public static boolean isPaymentExpired(LocalDateTime createdAt, int timeoutMinutes) {
        return LocalDateTime.now().isAfter(createdAt.plusMinutes(timeoutMinutes));
    }
    
    /**
     * Format datetime cho payment gateway
     */
    public static String formatDateTime(LocalDateTime dateTime, String pattern) {
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }
    
    /**
     * Parse datetime từ string
     */
    public static LocalDateTime parseDateTime(String dateTimeStr, String pattern) {
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern(pattern));
        } catch (Exception e) {
            log.error("Error parsing datetime: {}", dateTimeStr, e);
            return null;
        }
    }
} 
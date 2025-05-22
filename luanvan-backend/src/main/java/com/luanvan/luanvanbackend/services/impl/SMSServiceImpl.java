package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.services.SMSService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SMSServiceImpl implements SMSService {
    
    // TODO: Thay thế bằng cấu hình thực từ nhà cung cấp SMS khi triển khai
    @Value("${sms.api.url:mock}")
    private String apiUrl;
    
    @Value("${sms.api.key:mock-api-key}")
    private String apiKey;
    
    @Override
    public boolean sendSMS(String phoneNumber, String message) {
        // TODO: Triển khai gọi API của nhà cung cấp SMS
        
        // Mock implementation - Trong giai đoạn phát triển, chỉ log ra console
        log.info("Gửi SMS đến số {}: {}", phoneNumber, message);
        log.info("URL API: {}, API Key: {}", apiUrl, apiKey);
        
        return true; // Giả định thành công trong môi trường phát triển
    }
    
    @Override
    public boolean sendOTP(String phoneNumber, String otp) {
        String message = "Mã xác thực OTP của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút.";
        return sendSMS(phoneNumber, message);
    }
} 
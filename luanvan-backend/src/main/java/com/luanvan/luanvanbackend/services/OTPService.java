package com.luanvan.luanvanbackend.services;

public interface OTPService {
    // Sinh mã OTP ngẫu nhiên
    String generateOTP();
    
    // Lưu OTP vào database với thời gian hiệu lực
    void saveOTP(String phoneNumber, String otp, String sessionId);
    
    // Xác thực OTP
    boolean verifyOTP(String sessionId, String otp);
    
    // Tạo sessionId mới
    String generateSessionId();
} 
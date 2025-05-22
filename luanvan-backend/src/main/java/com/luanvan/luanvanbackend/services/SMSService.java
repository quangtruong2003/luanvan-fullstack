package com.luanvan.luanvanbackend.services;

public interface SMSService {
    // Phương thức gửi SMS
    boolean sendSMS(String phoneNumber, String message);
    
    // Phương thức gửi OTP
    boolean sendOTP(String phoneNumber, String otp);
} 
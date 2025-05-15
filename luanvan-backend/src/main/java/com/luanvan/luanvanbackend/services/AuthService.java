package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.entities.User;

public interface AuthService {
    
    /**
     * Đăng ký tài khoản cho bệnh nhân
     * @param registrationDTO Thông tin đăng ký
     * @return User đã được tạo
     */
    User registerPatient(PatientRegistrationDTO registrationDTO);
    
    /**
     * Gửi mã OTP tới số điện thoại
     * @param phoneNumber Số điện thoại cần gửi OTP
     * @return true nếu gửi thành công
     */
    boolean sendOTP(String phoneNumber);
    
    /**
     * Xác thực mã OTP
     * @param phoneNumber Số điện thoại đã nhận OTP
     * @param otpCode Mã OTP nhập vào
     * @return true nếu OTP hợp lệ
     */
    boolean verifyOTP(String phoneNumber, String otpCode);
    
    /**
     * Đăng nhập người dùng
     * @param loginRequest Thông tin đăng nhập
     * @return Token JWT và thông tin người dùng
     */
    AuthResponseDTO login(LoginRequestDTO loginRequest);
    
    /**
     * Lấy thông tin người dùng hiện tại
     * @return Thông tin người dùng đang đăng nhập
     */
    User getCurrentUser();
} 
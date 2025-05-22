package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.RegisterRequest;
import com.luanvan.luanvanbackend.request.ResendOTPRequest;
import com.luanvan.luanvanbackend.request.VerifyOTPRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.RegisterResponse;
import com.luanvan.luanvanbackend.response.ResendOTPResponse;
import com.luanvan.luanvanbackend.response.VerifyOTPResponse;

public interface AuthService {
    
    /**
     * Đăng ký tài khoản cho bệnh nhân
     * @param registrationDTO Thông tin đăng ký
     * @return User đã được tạo
     */
    User registerPatient(PatientRegistrationDTO registrationDTO);
    
    /**
     * Đăng ký tài khoản với số điện thoại và OTP
     * @param request Thông tin đăng ký
     * @return Kết quả đăng ký và sessionId
     */
    RegisterResponse register(RegisterRequest request);
    
    /**
     * Xác thực OTP
     * @param request Thông tin xác thực OTP
     * @return Kết quả xác thực và JWT token
     */
    VerifyOTPResponse verifyOTP(VerifyOTPRequest request);
    
    /**
     * Gửi lại OTP
     * @param request Thông tin gửi lại OTP
     * @return Kết quả gửi lại OTP
     */
    ResendOTPResponse resendOTP(ResendOTPRequest request);
    
    /**
     * Đăng nhập với số điện thoại và mật khẩu
     * @param request Thông tin đăng nhập
     * @return Kết quả đăng nhập và JWT token
     */
    LoginResponse login(LoginRequest request);
    
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
package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.ClerkUserSyncRequest;
import com.luanvan.luanvanbackend.request.UserCreateRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.ClerkUserSyncResponse;
import com.luanvan.luanvanbackend.response.UserCreateResponse;

public interface AuthService {
    
    /**
     * Đăng ký tài khoản cho bệnh nhân
     * @param registrationDTO Thông tin đăng ký
     * @return User đã được tạo
     */
    User registerPatient(PatientRegistrationDTO registrationDTO);
    
    /**
     * Đăng nhập với tên đăng nhập và mật khẩu
     * @param request Thông tin đăng nhập
     * @return Kết quả đăng nhập và JWT token
     */
    LoginResponse login(LoginRequest request);
    
    /**
     * Đồng bộ thông tin user từ Clerk
     * @param request Thông tin user từ Clerk
     * @return Kết quả đồng bộ
     */
    ClerkUserSyncResponse syncClerkUser(ClerkUserSyncRequest request);
    
    /**
     * Tạo tài khoản admin hoặc doctor mới
     * @param request Thông tin tài khoản cần tạo
     * @return Kết quả tạo tài khoản
     */
    UserCreateResponse createUser(UserCreateRequest request);
    
    /**
     * Tạo tài khoản admin đầu tiên mà không yêu cầu xác thực
     * @param request Thông tin tài khoản admin cần tạo
     * @return Kết quả tạo tài khoản
     */
    UserCreateResponse createFirstAdmin(UserCreateRequest request);
    
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
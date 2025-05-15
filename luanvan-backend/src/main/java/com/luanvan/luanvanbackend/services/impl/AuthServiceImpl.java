package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AuthResponseDTO;
import com.luanvan.luanvanbackend.dto.LoginRequestDTO;
import com.luanvan.luanvanbackend.dto.PatientRegistrationDTO;
import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Cần bổ sung thêm JwtTokenProvider sau khi cấu hình Spring Security

    @Override
    public User registerPatient(PatientRegistrationDTO registrationDTO) {
        // Kiểm tra xem người dùng đã tồn tại chưa
        if (userRepository.existsByPhoneNumber(registrationDTO.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký");
        }
        
        if (registrationDTO.getEmail() != null && !registrationDTO.getEmail().isEmpty() 
                && userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Tạo user mới
        User newUser = new User();
        newUser.setFullName(registrationDTO.getFullName());
        newUser.setPhoneNumber(registrationDTO.getPhoneNumber());
        newUser.setEmail(registrationDTO.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(registrationDTO.getPassword()));
        newUser.setDateOfBirth(registrationDTO.getDateOfBirth());
        newUser.setGender(registrationDTO.getGender());
        newUser.setAddress(registrationDTO.getAddress());
        newUser.setRegistrationDate(LocalDateTime.now());
        newUser.setActive(true);
        
        // Gán vai trò "PATIENT"
        Role patientRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new RuntimeException("Vai trò PATIENT không tồn tại"));
        newUser.setRole(patientRole);
        
        // Lưu user mới
        return userRepository.save(newUser);
    }

    @Override
    public boolean sendOTP(String phoneNumber) {
        // TODO: Tích hợp với SMS Gateway để gửi OTP
        // Giả lập thành công
        return true;
    }

    @Override
    public boolean verifyOTP(String phoneNumber, String otpCode) {
        // TODO: Kiểm tra OTP từ hệ thống lưu trữ tạm thời
        // Giả lập thành công
        return true;
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        // TODO: Xác thực người dùng và tạo JWT token
        // Hiện tại chỉ là stub - cần triển khai khi có Spring Security & JWT
        return new AuthResponseDTO("dummy-token", 1L, "Tên người dùng", "email@example.com", 
                loginRequest.getPhoneNumber(), "PATIENT");
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = authentication.getName();
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }
} 
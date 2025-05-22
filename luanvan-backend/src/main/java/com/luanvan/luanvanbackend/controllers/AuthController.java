package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.RegisterRequest;
import com.luanvan.luanvanbackend.request.ResendOTPRequest;
import com.luanvan.luanvanbackend.request.VerifyOTPRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.RegisterResponse;
import com.luanvan.luanvanbackend.response.ResendOTPResponse;
import com.luanvan.luanvanbackend.response.VerifyOTPResponse;
import com.luanvan.luanvanbackend.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOTPResponse> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        VerifyOTPResponse response = authService.verifyOTP(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<ResendOTPResponse> resendOTP(@Valid @RequestBody ResendOTPRequest request) {
        ResendOTPResponse response = authService.resendOTP(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
} 
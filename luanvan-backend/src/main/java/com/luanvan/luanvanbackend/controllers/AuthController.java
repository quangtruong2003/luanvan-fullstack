package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.request.LoginRequest;
import com.luanvan.luanvanbackend.request.ClerkUserSyncRequest;
import com.luanvan.luanvanbackend.request.UserCreateRequest;
import com.luanvan.luanvanbackend.response.LoginResponse;
import com.luanvan.luanvanbackend.response.ClerkUserSyncResponse;
import com.luanvan.luanvanbackend.response.UserCreateResponse;
import com.luanvan.luanvanbackend.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/clerk-sync")
    public ResponseEntity<ClerkUserSyncResponse> syncClerkUser(@Valid @RequestBody ClerkUserSyncRequest request) {
        ClerkUserSyncResponse response = authService.syncClerkUser(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserCreateResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserCreateResponse response = authService.createUser(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Endpoint đặc biệt để tạo tài khoản admin đầu tiên
     * Chỉ nên sử dụng khi hệ thống chưa có tài khoản admin nào
     */
    @PostMapping("/create-first-admin")
    public ResponseEntity<UserCreateResponse> createFirstAdmin(@Valid @RequestBody UserCreateRequest request) {
        // Kiểm tra role phải là ADMIN
        if (!"ADMIN".equalsIgnoreCase(request.getRole())) {
            return ResponseEntity.badRequest().body(
                UserCreateResponse.builder()
                    .success(false)
                    .message("Endpoint này chỉ được sử dụng để tạo tài khoản ADMIN")
                    .build()
            );
        }
        
        UserCreateResponse response = authService.createFirstAdmin(request);
        return ResponseEntity.ok(response);
    }
} 
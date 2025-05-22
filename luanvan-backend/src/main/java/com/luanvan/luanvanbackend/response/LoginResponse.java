package com.luanvan.luanvanbackend.response;

import com.luanvan.luanvanbackend.dto.UserInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserInfoDTO userInfo; // Thông tin cơ bản của người dùng
} 
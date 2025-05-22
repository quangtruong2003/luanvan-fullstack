package com.luanvan.luanvanbackend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOTPResponse {
    private boolean success;
    private String message;
    private String token; // JWT token nếu xác thực thành công
} 
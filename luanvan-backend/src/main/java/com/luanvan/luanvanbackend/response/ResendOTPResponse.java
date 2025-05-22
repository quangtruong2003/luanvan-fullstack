package com.luanvan.luanvanbackend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendOTPResponse {
    private boolean success;
    private String message;
    private String sessionId; // Có thể là sessionId mới
} 
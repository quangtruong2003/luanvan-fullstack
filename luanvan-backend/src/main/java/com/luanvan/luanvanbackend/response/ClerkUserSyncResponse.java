package com.luanvan.luanvanbackend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClerkUserSyncResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String fullName;
    private String email;
    private boolean isNewUser;
    private String token; // JWT token for patient authentication
    private String role; // User role
} 
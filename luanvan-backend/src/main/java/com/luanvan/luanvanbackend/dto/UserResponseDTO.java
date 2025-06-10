package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String imageUrl;
    private String roleName;
    private boolean active;
} 
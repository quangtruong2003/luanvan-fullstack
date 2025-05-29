package com.luanvan.luanvanbackend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClerkUserSyncRequest {
    @NotBlank(message = "Clerk user ID không được để trống")
    private String clerkUserId;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String imageUrl;
} 
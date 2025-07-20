package com.luanvan.luanvanbackend.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty(value = "clerkUserId", access = JsonProperty.Access.WRITE_ONLY)
    private String clerkUserId;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @JsonProperty(value = "firstName", access = JsonProperty.Access.WRITE_ONLY)
    private String firstName;
    
    @JsonProperty(value = "lastName", access = JsonProperty.Access.WRITE_ONLY)
    private String lastName;
    
    @JsonProperty(value = "phoneNumber", access = JsonProperty.Access.WRITE_ONLY)
    private String phoneNumber;
    
    @JsonProperty(value = "imageUrl", access = JsonProperty.Access.WRITE_ONLY)
    private String imageUrl;

    // Explicit getter methods for Docker compatibility
    public String getClerkUserId() {
        return clerkUserId;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }
} 
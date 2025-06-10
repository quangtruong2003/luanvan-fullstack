package com.luanvan.luanvanbackend.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @JsonProperty(value = "email", access = JsonProperty.Access.WRITE_ONLY)
    private String email;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
} 
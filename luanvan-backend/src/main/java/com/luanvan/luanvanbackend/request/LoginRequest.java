package com.luanvan.luanvanbackend.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @JsonProperty(value = "phoneNumber", access = JsonProperty.Access.WRITE_ONLY)
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
} 
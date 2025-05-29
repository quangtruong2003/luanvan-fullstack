package com.luanvan.luanvanbackend.request;

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
    @Pattern(regexp = "^(admin|doctor|(0|\\+84)[3|5|7|8|9][0-9]{8})$", message = "Tên đăng nhập không hợp lệ")
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
} 
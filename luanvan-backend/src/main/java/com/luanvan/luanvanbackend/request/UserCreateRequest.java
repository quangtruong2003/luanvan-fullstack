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
public class UserCreateRequest {
    @JsonProperty(value = "phoneNumber", access = JsonProperty.Access.WRITE_ONLY)
    private String phoneNumber; // Optional cho admin/doctor
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    @JsonProperty(value = "fullName", access = JsonProperty.Access.WRITE_ONLY)
    private String fullName;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vai trò không được để trống")
    private String role; // ADMIN hoặc DOCTOR
} 
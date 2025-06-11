package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Column(unique = true, nullable = false)
    private String email;
    
    @Pattern(regexp = "^$|^[0-9]{10,15}$", message = "Số điện thoại phải là 10-15 chữ số hoặc để trống.")
    @Column(unique = true)
    private String phoneNumber; // Optional cho admin/doctor, bắt buộc cho patient
    
    @Column(unique = true)
    private String clerkUserId; // Clerk user ID for integration
    
    private String passwordHash;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String imageUrl; // Profile image URL from Clerk
    private LocalDateTime registrationDate;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean isActive;
    private boolean emailNotificationsEnabled = true;
    
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
    }
}

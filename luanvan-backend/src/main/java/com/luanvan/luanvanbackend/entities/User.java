package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
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
    
    @Column(unique = true)
    private String email;
    
    @Column(unique = true)
    private String phoneNumber;
    
    private String passwordHash;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDateTime registrationDate;
    private boolean isActive;
    
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
}

package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegistrationDTO {
    private String fullName;
    private String phoneNumber;
    private String email;
    private String password;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
} 
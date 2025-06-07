package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    @JsonProperty(value = "fullName", access = JsonProperty.Access.WRITE_ONLY)
    private String fullName;
    
    private String email;
    
    @JsonProperty(value = "dateOfBirth", access = JsonProperty.Access.WRITE_ONLY)
    private LocalDate dateOfBirth;
    
    private String gender;
    private String address;
} 
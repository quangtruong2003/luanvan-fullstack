package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicDTO {
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String logoURL;
    private String description;
    private String workingHours;
    private String history;
    private String vision;
    private String mission;
    private String coreValues;
    private String facilitiesDescription;
    private String equipmentDescription;
} 
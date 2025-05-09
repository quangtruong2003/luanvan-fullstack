package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clinics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Clinic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long clinicId;
    
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String logoURL;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String workingHours;
    
    @Column(columnDefinition = "TEXT")
    private String history;
    
    @Column(columnDefinition = "TEXT")
    private String vision;
    
    @Column(columnDefinition = "TEXT")
    private String mission;
    
    @Column(columnDefinition = "TEXT")
    private String coreValues;
    
    @Column(columnDefinition = "TEXT")
    private String facilitiesDescription;
    
    @Column(columnDefinition = "TEXT")
    private String equipmentDescription;
}

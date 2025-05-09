package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    @Id
    private Long doctorId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private Integer yearsOfExperience;
    private String profilePictureURL;
    
    @OneToMany(mappedBy = "doctor")
    private Set<DoctorSpecialty> specialties;
    
    @OneToMany(mappedBy = "doctor")
    private Set<AvailabilitySlot> availabilitySlots;
}

package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
    
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    
    @Enumerated(EnumType.STRING)
    private SlotStatus status;
    
    @ManyToOne
    @JoinColumn(name = "original_request_id")
    private DoctorAvailabilityRequest originalRequest;
    
    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;
    
    public enum SlotStatus {
        AVAILABLE, BOOKED, CANCELLED_BY_CLINIC, ON_LEAVE
    }
}

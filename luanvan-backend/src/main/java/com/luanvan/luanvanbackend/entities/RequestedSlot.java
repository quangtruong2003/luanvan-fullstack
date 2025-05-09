package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "requested_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestedSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestedSlotId;
    
    @ManyToOne
    @JoinColumn(name = "request_id")
    private DoctorAvailabilityRequest request;
    
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
}

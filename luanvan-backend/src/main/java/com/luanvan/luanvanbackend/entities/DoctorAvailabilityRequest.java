package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "doctor_availability_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailabilityRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
    
    private LocalDate weekStartDate;
    private LocalDateTime submissionTimestamp;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;
    
    private LocalDateTime reviewTimestamp;
    
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL)
    private Set<RequestedSlot> requestedSlots;
    
    public enum RequestStatus {
        PENDING, APPROVED, REJECTED, NEEDS_REVISION
    }
}

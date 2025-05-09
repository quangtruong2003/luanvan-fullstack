package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;
    
    @ManyToOne
    @JoinColumn(name = "slot_id")
    private AvailabilitySlot slot;
    
    @ManyToOne
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;
    
    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;
    
    private LocalDateTime appointmentDateTime;
    
    @Column(columnDefinition = "TEXT")
    private String reasonForVisit;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    
    private LocalDateTime bookingTimestamp;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal depositAmount;
    
    private boolean isDepositPaid;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatusMomo;
    
    private String paymentTransactionId;
    private LocalDateTime paymentTimestamp;
    private LocalDateTime cancellationTimestamp;
    
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    
    private boolean isDepositNonRefundable;
    
    public enum AppointmentStatus {
        PENDING_PAYMENT, CONFIRMED, COMPLETED, 
        CANCELLED_BY_PATIENT, CANCELLED_BY_CLINIC, PAYMENT_FAILED
    }
    
    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, CANCELLED
    }
}

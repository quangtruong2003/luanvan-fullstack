package com.luanvan.luanvanbackend.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots")
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
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;
    
    public enum SlotStatus {
        AVAILABLE, BOOKED, CANCELLED_BY_CLINIC, ON_LEAVE
    }
    
    public AvailabilitySlot() {
    }
    
    public AvailabilitySlot(Long slotId, Doctor doctor, LocalDate date, LocalTime startTime, LocalTime endTime, SlotStatus status, Clinic clinic) {
        this.slotId = slotId;
        this.doctor = doctor;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.clinic = clinic;
    }
    
    public Long getSlotId() {
        return slotId;
    }
    
    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public LocalTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public SlotStatus getStatus() {
        return status;
    }
    
    public void setStatus(SlotStatus status) {
        this.status = status;
    }
    
    public Clinic getClinic() {
        return clinic;
    }
    
    public void setClinic(Clinic clinic) {
        this.clinic = clinic;
    }
}

package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SlotIdRequestDTO {

    @NotNull(message = "Doctor ID cannot be null")
    @JsonProperty("doctor_id")
    private Long doctorId;

    @NotNull(message = "Specialty ID cannot be null")
    @JsonProperty("specialty_id")
    private Long specialtyId;

    @NotNull(message = "Clinic ID cannot be null")
    @JsonProperty("clinic_id")
    private Long clinicId;

    @NotNull(message = "Appointment date and time cannot be null")
    @JsonProperty("appointment_date_time")
    private LocalDateTime appointmentDateTime;

    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getSpecialtyId() {
        return specialtyId;
    }

    public void setSpecialtyId(Long specialtyId) {
        this.specialtyId = specialtyId;
    }

    public Long getClinicId() {
        return clinicId;
    }

    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
}

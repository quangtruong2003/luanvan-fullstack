package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.luanvan.luanvanbackend.dto.validation.ValidTimeRange;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.time.LocalTime;

@ValidTimeRange
@JsonIgnoreProperties(ignoreUnknown = true)
public class AvailabilitySlotDTO {
    
    @NotNull(message = "ID bác sĩ không được để trống")
    @JsonProperty("doctorId")
    @JsonAlias({"doctor_id", "doctorId"})
    private Long doctorId;
    
    @NotNull(message = "Ngày không được để trống")
    @FutureOrPresent(message = "Ngày phải là hôm nay hoặc trong tương lai")
    private LocalDate date;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @JsonProperty("startTime")
    @JsonAlias({"start_time", "startTime"})
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @JsonProperty("endTime")
    @JsonAlias({"end_time", "endTime"})
    private LocalTime endTime;
    
    @Pattern(regexp = "^(AVAILABLE|BOOKED|CANCELLED_BY_CLINIC|ON_LEAVE)$", message = "Trạng thái phải là AVAILABLE, BOOKED, CANCELLED_BY_CLINIC hoặc ON_LEAVE")
    private String status;
    
    @NotNull(message = "ID phòng khám không được để trống")
    @JsonProperty("clinicId")
    @JsonAlias({"clinic_id", "clinicId"})
    private Long clinicId;
    
    public AvailabilitySlotDTO() {
    }
    
    public AvailabilitySlotDTO(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime, String status, Long clinicId) {
        this.doctorId = doctorId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.clinicId = clinicId;
    }
    
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getClinicId() {
        return clinicId;
    }
    
    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }
} 
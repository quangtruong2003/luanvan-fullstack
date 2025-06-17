package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicResponseDTO {
    private Long clinicId;
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String logoURL;
    private String description;
    
    /**
     * Working hours as array for frontend display (easier to observe).
     * Generated from StandardWorkShift data for display compatibility.
     */
    @JsonProperty("working_hours")
    private List<WorkingHoursInfo> workingHoursArray;
    
    private String history;
    private String vision;
    private String mission;
    private String coreValues;
    private String facilitiesDescription;
    private String equipmentDescription;
    private List<SpecialtyInfo> specialties;
    private List<StandardWorkShiftInfo> standardWorkShifts;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecialtyInfo {
        private Long specialtyId;
        private String name;
        private String description;
        private Long doctorCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StandardWorkShiftInfo {
        private Long shiftId;
        private String shiftName;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean isDefault;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkingHoursInfo {
        private Long workingHoursId;  // Map from shiftId for compatibility
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean isDefault;
    }
} 
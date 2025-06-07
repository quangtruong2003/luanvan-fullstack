package com.luanvan.luanvanbackend.dto;

import com.luanvan.luanvanbackend.dto.validation.ValidTimeRange;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ValidTimeRange
public class AvailabilitySlotDTO {
    
    @NotNull(message = "ID bác sĩ không được để trống")
    private Long doctorId;
    
    @NotNull(message = "Ngày không được để trống")
    @FutureOrPresent(message = "Ngày phải là hôm nay hoặc trong tương lai")
    private LocalDate date;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalTime endTime;
    
    @Pattern(regexp = "^(AVAILABLE|BOOKED|CANCELLED)$", message = "Trạng thái phải là AVAILABLE, BOOKED hoặc CANCELLED")
    private String status;
    
    @NotNull(message = "ID phòng khám không được để trống")
    private Long clinicId;
} 
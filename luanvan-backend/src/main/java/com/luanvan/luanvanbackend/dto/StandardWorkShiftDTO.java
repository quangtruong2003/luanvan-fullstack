package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.luanvan.luanvanbackend.dto.validation.ValidTimeRange;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ValidTimeRange
public class StandardWorkShiftDTO {
    
    @NotBlank(message = "Tên ca làm việc không được để trống")
    @Size(min = 2, max = 100, message = "Tên ca làm việc phải từ 2-100 ký tự")
    @JsonProperty("shiftName")
    private String shiftName;
    
    @NotNull(message = "Ngày trong tuần không được để trống")
    @JsonProperty("dayOfWeek")
    private DayOfWeek dayOfWeek;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @JsonProperty("startTime")
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @JsonProperty("endTime")
    private LocalTime endTime;
    
    @NotNull(message = "ID phòng khám không được để trống")
    @JsonProperty("clinicId")
    private Long clinicId;
    
    @JsonProperty("isDefault")
    private Boolean isDefault;
} 
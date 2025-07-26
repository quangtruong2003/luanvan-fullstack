package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.luanvan.luanvanbackend.entities.ClinicOfflineDate.RecurringType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO cho thông tin ngày nghỉ của phòng khám
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicOfflineDateDTO {
    
    @JsonProperty("offlineDateId")
    private Long offlineDateId;
    
    // Xóa @NotNull vì clinicId sẽ được gán từ đường dẫn URL
    @JsonProperty("clinicId")
    private Long clinicId;
    
    @NotNull(message = "Ngày nghỉ không được để trống")
    @FutureOrPresent(message = "Ngày nghỉ phải là ngày hiện tại hoặc trong tương lai")
    @JsonProperty("date")
    private LocalDate date;
    
    @Size(max = 500, message = "Lý do nghỉ không được quá 500 ký tự")
    @JsonProperty("reason")
    private String reason;
    
    @JsonProperty("isRecurring")
    private Boolean isRecurring = false;
    
    @JsonProperty("recurringType")
    private RecurringType recurringType = RecurringType.NONE;
} 
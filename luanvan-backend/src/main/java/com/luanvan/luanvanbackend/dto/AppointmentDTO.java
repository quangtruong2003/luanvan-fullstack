package com.luanvan.luanvanbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    
    @NotNull(message = "ID bệnh nhân không được để trống")
    private Long patientId;
    
    @NotNull(message = "ID bác sĩ không được để trống")
    private Long doctorId;
    
    @NotNull(message = "ID slot thời gian không được để trống")
    private Long slotId;
    
    @NotNull(message = "ID chuyên khoa không được để trống")
    private Long specialtyId;
    
    @NotNull(message = "ID phòng khám không được để trống")
    private Long clinicId;
    
    @NotNull(message = "Thời gian hẹn không được để trống")
    @Future(message = "Thời gian hẹn phải là thời điểm trong tương lai")
    private LocalDateTime appointmentDateTime;
    
    @Size(max = 500, message = "Lý do khám không được vượt quá 500 ký tự")
    private String reasonForVisit;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền đặt cọc phải lớn hơn 0")
    private BigDecimal depositAmount;
    
    private Boolean isDepositPaid;
} 
package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long patientId;
    private Long doctorId;
    private Long slotId;
    private Long specialtyId;
    private Long clinicId;
    private LocalDateTime appointmentDateTime;
    private String reasonForVisit;
    private BigDecimal depositAmount;
    private Boolean isDepositPaid;
} 
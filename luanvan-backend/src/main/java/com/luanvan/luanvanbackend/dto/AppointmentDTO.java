package com.luanvan.luanvanbackend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppointmentDTO {

    private Long id;
    
    @NotNull(message = "ID bệnh nhân không được để trống")
    @JsonAlias("patient_id")
    private Long patientId;
    private String patientName;
    
    @NotNull(message = "ID bác sĩ không được để trống")
    @JsonAlias("doctor_id")
    private Long doctorId;
    private String doctorName;
    
    @NotNull(message = "ID slot thời gian không được để trống")
    @JsonAlias("slot_id")
    private Long slotId;
    
    @NotNull(message = "ID chuyên khoa không được để trống")
    @JsonAlias("specialty_id")
    private Long specialtyId;
    private String specialtyName;
    
    @NotNull(message = "ID phòng khám không được để trống")
    @JsonAlias("clinic_id")
    private Long clinicId;
    private String clinicName;
    private String clinicAddress;
    
    @NotNull(message = "Thời gian hẹn không được để trống")
    @Future(message = "Thời gian hẹn phải là thời điểm trong tương lai")
    @JsonAlias("appointment_date_time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentDateTime;
    
    @Size(max = 500, message = "Lý do khám không được vượt quá 500 ký tự")
    @JsonAlias("reason_for_visit")
    private String reasonForVisit;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền đặt cọc phải lớn hơn 0")
    @JsonAlias("deposit_amount")
    private BigDecimal depositAmount;
    
    @JsonAlias("is_deposit_paid")
    private Boolean isDepositPaid;

    private String status;
} 
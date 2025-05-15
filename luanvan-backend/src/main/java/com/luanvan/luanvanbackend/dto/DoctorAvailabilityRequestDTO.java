package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailabilityRequestDTO {
    private LocalDate weekStartDate;
    private List<RequestedSlotDTO> requestedSlots;
} 
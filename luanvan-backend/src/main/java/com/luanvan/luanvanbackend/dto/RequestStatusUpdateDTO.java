package com.luanvan.luanvanbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestStatusUpdateDTO {
    private String status; // "APPROVED", "REJECTED"
    private String reviewNotes;
} 
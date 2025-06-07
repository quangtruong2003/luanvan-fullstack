package com.luanvan.luanvanbackend.dto.validation;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.dto.StandardWorkShiftDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidTimeRangeValidator implements ConstraintValidator<ValidTimeRange, Object> {

    @Override
    public void initialize(ValidTimeRange constraintAnnotation) {
        // Initialization if needed
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null values
        }

        if (value instanceof AvailabilitySlotDTO dto) {
            if (dto.getStartTime() == null || dto.getEndTime() == null) {
                return true; // Let @NotNull handle null values
            }
            return dto.getStartTime().isBefore(dto.getEndTime());
        }

        if (value instanceof StandardWorkShiftDTO dto) {
            if (dto.getStartTime() == null || dto.getEndTime() == null) {
                return true; // Let @NotNull handle null values
            }
            return dto.getStartTime().isBefore(dto.getEndTime());
        }

        return true; // For other types, return true
    }
} 
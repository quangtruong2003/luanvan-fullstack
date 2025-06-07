package com.luanvan.luanvanbackend.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidTimeRangeValidator.class)
@Documented
public @interface ValidTimeRange {
    String message() default "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
} 
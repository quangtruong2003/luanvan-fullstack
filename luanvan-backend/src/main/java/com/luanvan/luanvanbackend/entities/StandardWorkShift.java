package com.luanvan.luanvanbackend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "standard_work_shifts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StandardWorkShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("shiftId")
    private Long shiftId;
    
    @JsonProperty("shiftName")
    private String shiftName;
    
    @Enumerated(EnumType.STRING)
    @JsonProperty("dayOfWeek")
    private DayOfWeek dayOfWeek;
    
    @JsonProperty("startTime")
    private LocalTime startTime;
    
    @JsonProperty("endTime")
    private LocalTime endTime;
    
    @ManyToOne
    @JoinColumn(name = "clinic_id")
    @JsonProperty("clinic")
    private Clinic clinic;
    
    @Column(name = "is_default", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @JsonProperty("isDefault")
    private boolean isDefault = false;
}

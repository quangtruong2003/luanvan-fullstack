package com.luanvan.luanvanbackend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity lưu thông tin về ngày phòng khám không hoạt động (offline)
 */
@Entity
@Table(name = "clinic_offline_dates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicOfflineDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("offlineDateId")
    private Long offlineDateId;
    
    @ManyToOne
    @JoinColumn(name = "clinic_id")
    @JsonProperty("clinic")
    private Clinic clinic;
    
    @JsonProperty("date")
    private LocalDate date;
    
    @Column(columnDefinition = "TEXT")
    @JsonProperty("reason")
    private String reason;
    
    @Column(name = "is_recurring", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @JsonProperty("isRecurring")
    private boolean isRecurring = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurring_type")
    @JsonProperty("recurringType")
    private RecurringType recurringType = RecurringType.NONE;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Enum định nghĩa các kiểu lặp lại cho ngày nghỉ
     */
    public enum RecurringType {
        NONE,      // Không lặp lại
        WEEKLY,    // Lặp lại hàng tuần
        MONTHLY,   // Lặp lại hàng tháng
        YEARLY     // Lặp lại hàng năm
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 
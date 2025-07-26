package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.ClinicOfflineDateDTO;
import com.luanvan.luanvanbackend.dto.response.ApiResponse;
import com.luanvan.luanvanbackend.entities.ClinicOfflineDate;
import com.luanvan.luanvanbackend.services.ClinicOfflineDateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller xử lý API liên quan đến ngày nghỉ của phòng khám
 */
@RestController
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
public class ClinicOfflineDateController {
    
    private final ClinicOfflineDateService clinicOfflineDateService;
    
    /**
     * Lấy danh sách ngày nghỉ của phòng khám có phân trang
     */
    @GetMapping("/{clinicId}/offline-dates")
    public ResponseEntity<Page<ClinicOfflineDate>> getOfflineDates(
            @PathVariable Long clinicId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ClinicOfflineDate> offlineDates = clinicOfflineDateService.getOfflineDatesByClinic(clinicId, pageable);
        return ResponseEntity.ok(offlineDates);
    }
    
    /**
     * Lấy tất cả ngày nghỉ của phòng khám (không phân trang)
     */
    @GetMapping("/{clinicId}/offline-dates/all")
    public ResponseEntity<List<ClinicOfflineDate>> getAllOfflineDates(@PathVariable Long clinicId) {
        List<ClinicOfflineDate> offlineDates = clinicOfflineDateService.getOfflineDatesByClinic(clinicId);
        return ResponseEntity.ok(offlineDates);
    }
    
    /**
     * Lấy thông tin chi tiết của một ngày nghỉ
     */
    @GetMapping("/{clinicId}/offline-dates/{offlineDateId}")
    public ResponseEntity<ClinicOfflineDate> getOfflineDateById(
            @PathVariable Long clinicId, 
            @PathVariable Long offlineDateId) {
        ClinicOfflineDate offlineDate = clinicOfflineDateService.getOfflineDateById(offlineDateId);
        return ResponseEntity.ok(offlineDate);
    }
    
    /**
     * Lấy danh sách ngày nghỉ trong khoảng thời gian
     */
    @GetMapping("/{clinicId}/offline-dates/range")
    public ResponseEntity<List<ClinicOfflineDate>> getOfflineDatesByRange(
            @PathVariable Long clinicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ClinicOfflineDate> offlineDates = 
            clinicOfflineDateService.getOfflineDatesByClinicAndDateRange(clinicId, startDate, endDate);
        return ResponseEntity.ok(offlineDates);
    }
    
    /**
     * Kiểm tra xem ngày có phải là ngày nghỉ của phòng khám không
     */
    @GetMapping("/{clinicId}/is-offline")
    public ResponseEntity<ApiResponse<Boolean>> isClinicOfflineOnDate(
            @PathVariable Long clinicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        boolean isOffline = clinicOfflineDateService.isClinicOfflineOnDate(clinicId, date);
        ApiResponse<Boolean> response = new ApiResponse<>(
            true, 
            isOffline ? "Phòng khám nghỉ vào ngày này" : "Phòng khám hoạt động bình thường vào ngày này", 
            isOffline
        );
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy danh sách các ngày nghỉ sắp tới (từ ngày hiện tại)
     */
    @GetMapping("/{clinicId}/offline-dates/upcoming")
    public ResponseEntity<List<ClinicOfflineDate>> getUpcomingOfflineDates(@PathVariable Long clinicId) {
        List<ClinicOfflineDate> upcomingDates = clinicOfflineDateService.getUpcomingOfflineDates(clinicId);
        return ResponseEntity.ok(upcomingDates);
    }
    
    /**
     * Lấy danh sách các ngày nghỉ lặp lại theo loại
     */
    @GetMapping("/{clinicId}/offline-dates/recurring/{recurringType}")
    public ResponseEntity<List<ClinicOfflineDate>> getRecurringOfflineDates(
            @PathVariable Long clinicId,
            @PathVariable ClinicOfflineDate.RecurringType recurringType) {
        List<ClinicOfflineDate> recurringDates = 
            clinicOfflineDateService.getRecurringOfflineDates(clinicId, recurringType);
        return ResponseEntity.ok(recurringDates);
    }
    
    /**
     * Tạo mới ngày nghỉ (chỉ Admin)
     */
    @PostMapping("/{clinicId}/offline-dates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicOfflineDate> createOfflineDate(
            @PathVariable Long clinicId,
            @RequestBody ClinicOfflineDateDTO offlineDateDTO) {
        // Set ID của phòng khám từ path variable trước khi validation
        offlineDateDTO.setClinicId(clinicId);
        
        // Kiểm tra thủ công các trường bắt buộc khác
        if (offlineDateDTO.getDate() == null) {
            throw new IllegalArgumentException("Ngày nghỉ không được để trống");
        }
        
        // Kiểm tra ngày trong tương lai hoặc hiện tại
        if (offlineDateDTO.getDate() != null && offlineDateDTO.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Ngày nghỉ phải là ngày hiện tại hoặc trong tương lai");
        }
        
        // Kiểm tra độ dài lý do
        if (offlineDateDTO.getReason() != null && offlineDateDTO.getReason().length() > 500) {
            throw new IllegalArgumentException("Lý do nghỉ không được quá 500 ký tự");
        }
        
        ClinicOfflineDate createdDate = clinicOfflineDateService.createOfflineDate(offlineDateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDate);
    }
    
    /**
     * Cập nhật thông tin ngày nghỉ (chỉ Admin)
     */
    @PutMapping("/{clinicId}/offline-dates/{offlineDateId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicOfflineDate> updateOfflineDate(
            @PathVariable Long clinicId,
            @PathVariable Long offlineDateId,
            @RequestBody ClinicOfflineDateDTO offlineDateDTO) {
        // Set ID của phòng khám từ path variable trước khi validation
        offlineDateDTO.setClinicId(clinicId);
        
        // Kiểm tra thủ công các trường bắt buộc khác
        if (offlineDateDTO.getDate() != null && offlineDateDTO.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Ngày nghỉ phải là ngày hiện tại hoặc trong tương lai");
        }
        
        // Kiểm tra độ dài lý do
        if (offlineDateDTO.getReason() != null && offlineDateDTO.getReason().length() > 500) {
            throw new IllegalArgumentException("Lý do nghỉ không được quá 500 ký tự");
        }
        
        ClinicOfflineDate updatedDate = clinicOfflineDateService.updateOfflineDate(offlineDateId, offlineDateDTO);
        return ResponseEntity.ok(updatedDate);
    }
    
    /**
     * Xóa ngày nghỉ (chỉ Admin)
     */
    @DeleteMapping("/{clinicId}/offline-dates/{offlineDateId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteOfflineDate(
            @PathVariable Long clinicId,
            @PathVariable Long offlineDateId) {
        boolean success = clinicOfflineDateService.deleteOfflineDate(offlineDateId);
        ApiResponse<String> response = new ApiResponse<>(
            success,
            success ? "Đã xóa ngày nghỉ thành công" : "Không thể xóa ngày nghỉ",
            null
        );
        return ResponseEntity.ok(response);
    }
} 
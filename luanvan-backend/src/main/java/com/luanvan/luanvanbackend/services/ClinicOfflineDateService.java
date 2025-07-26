package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.ClinicOfflineDateDTO;
import com.luanvan.luanvanbackend.entities.ClinicOfflineDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho ngày nghỉ phòng khám
 */
public interface ClinicOfflineDateService {

    /**
     * Lấy thông tin ngày nghỉ theo ID
     */
    ClinicOfflineDate getOfflineDateById(Long offlineDateId);
    
    /**
     * Lấy tất cả ngày nghỉ của phòng khám
     */
    List<ClinicOfflineDate> getOfflineDatesByClinic(Long clinicId);
    
    /**
     * Lấy danh sách ngày nghỉ có phân trang
     */
    Page<ClinicOfflineDate> getOfflineDatesByClinic(Long clinicId, Pageable pageable);
    
    /**
     * Lấy danh sách ngày nghỉ trong khoảng thời gian
     */
    List<ClinicOfflineDate> getOfflineDatesByClinicAndDateRange(Long clinicId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Tạo mới ngày nghỉ
     */
    ClinicOfflineDate createOfflineDate(ClinicOfflineDateDTO offlineDateDTO);
    
    /**
     * Cập nhật thông tin ngày nghỉ
     */
    ClinicOfflineDate updateOfflineDate(Long offlineDateId, ClinicOfflineDateDTO offlineDateDTO);
    
    /**
     * Xóa ngày nghỉ
     */
    boolean deleteOfflineDate(Long offlineDateId);
    
    /**
     * Kiểm tra xem ngày đã cho có phải là ngày nghỉ của phòng khám không
     * Xét cả ngày nghỉ thông thường và ngày nghỉ lặp lại
     */
    boolean isClinicOfflineOnDate(Long clinicId, LocalDate date);
    
    /**
     * Lấy danh sách ngày nghỉ của phòng khám từ ngày hiện tại trở đi
     */
    List<ClinicOfflineDate> getUpcomingOfflineDates(Long clinicId);
    
    /**
     * Lấy danh sách ngày nghỉ lặp lại theo kiểu
     */
    List<ClinicOfflineDate> getRecurringOfflineDates(Long clinicId, ClinicOfflineDate.RecurringType recurringType);
} 
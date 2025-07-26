package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.ClinicOfflineDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClinicOfflineDateRepository extends JpaRepository<ClinicOfflineDate, Long> {
    
    /**
     * Tìm tất cả ngày nghỉ của một phòng khám
     */
    List<ClinicOfflineDate> findByClinicClinicId(Long clinicId);
    
    /**
     * Tìm tất cả ngày nghỉ của một phòng khám có phân trang
     */
    Page<ClinicOfflineDate> findByClinicClinicId(Long clinicId, Pageable pageable);
    
    /**
     * Tìm ngày nghỉ của phòng khám trong khoảng thời gian
     */
    List<ClinicOfflineDate> findByClinicClinicIdAndDateBetween(Long clinicId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Kiểm tra xem một ngày có phải là ngày nghỉ của phòng khám không
     */
    boolean existsByClinicClinicIdAndDate(Long clinicId, LocalDate date);
    
    /**
     * Tìm tất cả ngày nghỉ của phòng khám từ ngày hiện tại trở đi
     */
    List<ClinicOfflineDate> findByClinicClinicIdAndDateGreaterThanEqual(Long clinicId, LocalDate date);
    
    /**
     * Tìm tất cả ngày nghỉ lặp lại theo kiểu lặp
     */
    List<ClinicOfflineDate> findByClinicClinicIdAndIsRecurringTrueAndRecurringType(
        Long clinicId, ClinicOfflineDate.RecurringType recurringType);
    
    /**
     * Kiểm tra xem ngày đã cho có phải là ngày nghỉ của phòng khám không, kể cả ngày nghỉ lặp lại
     * @param clinicId ID phòng khám
     * @param date Ngày cần kiểm tra
     * @return true nếu là ngày nghỉ, ngược lại false
     */
    @Query(value = """
        SELECT CASE WHEN COUNT(cod) > 0 THEN true ELSE false END FROM ClinicOfflineDate cod 
        WHERE cod.clinic.clinicId = :clinicId AND 
        (cod.date = :date OR 
         (cod.isRecurring = true AND 
          ((cod.recurringType = 'WEEKLY' AND FUNCTION('DAYOFWEEK', cod.date) = FUNCTION('DAYOFWEEK', :date)) OR 
           (cod.recurringType = 'MONTHLY' AND FUNCTION('DAYOFMONTH', cod.date) = FUNCTION('DAYOFMONTH', :date)) OR 
           (cod.recurringType = 'YEARLY' AND FUNCTION('DAYOFYEAR', cod.date) = FUNCTION('DAYOFYEAR', :date))))
        )
    """)
    boolean isClinicOfflineOnDate(@Param("clinicId") Long clinicId, @Param("date") LocalDate date);
} 
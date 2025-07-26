package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ClinicOfflineDateDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.ClinicOfflineDate;
import com.luanvan.luanvanbackend.repositories.ClinicOfflineDateRepository;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.services.ClinicOfflineDateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Implementation của ClinicOfflineDateService
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ClinicOfflineDateServiceImpl implements ClinicOfflineDateService {
    
    private final ClinicOfflineDateRepository offlineDateRepository;
    private final ClinicRepository clinicRepository;

    @Override
    public ClinicOfflineDate getOfflineDateById(Long offlineDateId) {
        return offlineDateRepository.findById(offlineDateId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ngày nghỉ với ID: " + offlineDateId));
    }

    @Override
    public List<ClinicOfflineDate> getOfflineDatesByClinic(Long clinicId) {
        // Kiểm tra xem phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        return offlineDateRepository.findByClinicClinicId(clinicId);
    }

    @Override
    public Page<ClinicOfflineDate> getOfflineDatesByClinic(Long clinicId, Pageable pageable) {
        // Kiểm tra xem phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        return offlineDateRepository.findByClinicClinicId(clinicId, pageable);
    }

    @Override
    public List<ClinicOfflineDate> getOfflineDatesByClinicAndDateRange(Long clinicId, LocalDate startDate, LocalDate endDate) {
        // Kiểm tra xem phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        // Kiểm tra ngày bắt đầu và kết thúc
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
        }
        
        return offlineDateRepository.findByClinicClinicIdAndDateBetween(clinicId, startDate, endDate);
    }

    @Override
    public ClinicOfflineDate createOfflineDate(ClinicOfflineDateDTO offlineDateDTO) {
        // Tìm phòng khám
        Clinic clinic = clinicRepository.findById(offlineDateDTO.getClinicId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + offlineDateDTO.getClinicId()));
        
        // Kiểm tra xem ngày nghỉ đã tồn tại chưa
        if (offlineDateRepository.existsByClinicClinicIdAndDate(offlineDateDTO.getClinicId(), offlineDateDTO.getDate())) {
            throw new IllegalArgumentException("Ngày nghỉ đã tồn tại cho phòng khám này");
        }
        
        // Tạo entity mới
        ClinicOfflineDate offlineDate = new ClinicOfflineDate();
        offlineDate.setClinic(clinic);
        offlineDate.setDate(offlineDateDTO.getDate());
        offlineDate.setReason(offlineDateDTO.getReason());
        offlineDate.setRecurring(offlineDateDTO.getIsRecurring() != null ? offlineDateDTO.getIsRecurring() : false);
        
        // Nếu là ngày lặp lại, set kiểu lặp lại
        if (offlineDate.isRecurring()) {
            offlineDate.setRecurringType(
                offlineDateDTO.getRecurringType() != null 
                ? offlineDateDTO.getRecurringType() 
                : ClinicOfflineDate.RecurringType.NONE
            );
        } else {
            offlineDate.setRecurringType(ClinicOfflineDate.RecurringType.NONE);
        }
        
        // Lưu vào DB
        return offlineDateRepository.save(offlineDate);
    }

    @Override
    public ClinicOfflineDate updateOfflineDate(Long offlineDateId, ClinicOfflineDateDTO offlineDateDTO) {
        // Tìm ngày nghỉ hiện có
        ClinicOfflineDate existingOfflineDate = getOfflineDateById(offlineDateId);
        
        // Cập nhật thông tin nếu có
        if (offlineDateDTO.getDate() != null) {
            existingOfflineDate.setDate(offlineDateDTO.getDate());
        }
        
        if (offlineDateDTO.getReason() != null) {
            existingOfflineDate.setReason(offlineDateDTO.getReason());
        }
        
        if (offlineDateDTO.getIsRecurring() != null) {
            existingOfflineDate.setRecurring(offlineDateDTO.getIsRecurring());
            
            // Nếu đặt isRecurring = false, cũng reset recurringType về NONE
            if (!offlineDateDTO.getIsRecurring()) {
                existingOfflineDate.setRecurringType(ClinicOfflineDate.RecurringType.NONE);
            }
        }
        
        // Cập nhật recurringType nếu isRecurring = true
        if (existingOfflineDate.isRecurring() && offlineDateDTO.getRecurringType() != null) {
            existingOfflineDate.setRecurringType(offlineDateDTO.getRecurringType());
        }
        
        // Lưu vào DB
        return offlineDateRepository.save(existingOfflineDate);
    }

    @Override
    public boolean deleteOfflineDate(Long offlineDateId) {
        if (!offlineDateRepository.existsById(offlineDateId)) {
            throw new EntityNotFoundException("Không tìm thấy ngày nghỉ với ID: " + offlineDateId);
        }
        
        offlineDateRepository.deleteById(offlineDateId);
        return true;
    }

    @Override
    public boolean isClinicOfflineOnDate(Long clinicId, LocalDate date) {
        return offlineDateRepository.isClinicOfflineOnDate(clinicId, date);
    }

    @Override
    public List<ClinicOfflineDate> getUpcomingOfflineDates(Long clinicId) {
        // Kiểm tra xem phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return offlineDateRepository.findByClinicClinicIdAndDateGreaterThanEqual(clinicId, LocalDate.now());
    }

    @Override
    public List<ClinicOfflineDate> getRecurringOfflineDates(Long clinicId, ClinicOfflineDate.RecurringType recurringType) {
        // Kiểm tra xem phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new EntityNotFoundException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return offlineDateRepository.findByClinicClinicIdAndIsRecurringTrueAndRecurringType(clinicId, recurringType);
    }
} 
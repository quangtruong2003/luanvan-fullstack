package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.StandardWorkShiftDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.StandardWorkShiftRepository;
import com.luanvan.luanvanbackend.services.StandardWorkShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class StandardWorkShiftServiceImpl implements StandardWorkShiftService {

    @Autowired
    private StandardWorkShiftRepository shiftRepository;
    
    @Autowired
    private ClinicRepository clinicRepository;

    @Override
    public StandardWorkShift getShiftById(Long shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc với ID: " + shiftId));
    }

    @Override
    public List<StandardWorkShift> getAllShifts() {
        return shiftRepository.findAll();
    }

    @Override
    public Page<StandardWorkShift> getAllShifts(Pageable pageable) {
        return shiftRepository.findAll(pageable);
    }

    @Override
    public List<StandardWorkShift> getShiftsByClinic(Long clinicId) {
        // Kiểm tra phòng khám có tồn tại hay không
        if (!clinicRepository.existsById(clinicId)) {
            throw new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return shiftRepository.findByClinicClinicId(clinicId);
    }

    @Override
    public List<StandardWorkShift> getShiftsByDay(Integer dayOfWeek) {
        // Kiểm tra dayOfWeek có hợp lệ hay không (0-6)
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            throw new RuntimeException("Ngày trong tuần không hợp lệ. Giá trị phải từ 0-6.");
        }
        
        // Chuyển đổi từ Integer (0-6) sang DayOfWeek enum
        DayOfWeek day = DayOfWeek.of(dayOfWeek == 0 ? 7 : dayOfWeek); // Chuyển đổi 0 (CN) thành 7
        
        return shiftRepository.findByDayOfWeek(day);
    }

    @Override
    public List<StandardWorkShift> getDefaultShifts() {
        return shiftRepository.findByIsDefaultTrue();
    }

    @Override
    @Transactional
    public StandardWorkShift createShift(StandardWorkShiftDTO shiftDTO) {
        // Kiểm tra phòng khám có tồn tại hay không
        Clinic clinic = null;
        if (shiftDTO.getClinicId() != null) {
            clinic = clinicRepository.findById(shiftDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + shiftDTO.getClinicId()));
        }
        
        // Tạo ca làm việc mới
        StandardWorkShift shift = new StandardWorkShift();
        shift.setShiftName(shiftDTO.getShiftName());
        shift.setDayOfWeek(shiftDTO.getDayOfWeek());
        shift.setStartTime(shiftDTO.getStartTime());
        shift.setEndTime(shiftDTO.getEndTime());
        shift.setClinic(clinic);
        shift.setDefault(shiftDTO.getIsDefault() != null ? shiftDTO.getIsDefault() : false);
        
        return shiftRepository.save(shift);
    }

    @Override
    @Transactional
    public StandardWorkShift updateShift(Long shiftId, StandardWorkShiftDTO shiftDTO) {
        StandardWorkShift shift = getShiftById(shiftId);
        
        // Cập nhật thông tin
        if (shiftDTO.getShiftName() != null) {
            shift.setShiftName(shiftDTO.getShiftName());
        }
        
        if (shiftDTO.getDayOfWeek() != null) {
            shift.setDayOfWeek(shiftDTO.getDayOfWeek());
        }
        
        if (shiftDTO.getStartTime() != null) {
            shift.setStartTime(shiftDTO.getStartTime());
        }
        
        if (shiftDTO.getEndTime() != null) {
            shift.setEndTime(shiftDTO.getEndTime());
        }
        
        // Cập nhật phòng khám nếu có thay đổi
        if (shiftDTO.getClinicId() != null) {
            Clinic clinic = clinicRepository.findById(shiftDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + shiftDTO.getClinicId()));
            shift.setClinic(clinic);
        }
        
        if (shiftDTO.getIsDefault() != null) {
            shift.setDefault(shiftDTO.getIsDefault());
        }
        
        return shiftRepository.save(shift);
    }

    @Override
    @Transactional
    public boolean deleteShift(Long shiftId) {
        StandardWorkShift shift = getShiftById(shiftId);
        
        // Không cần kiểm tra các liên kết vì một ca làm việc chuẩn có thể bị xóa
        // bất kỳ lúc nào và không ảnh hưởng đến lịch làm việc đã được tạo
        
        shiftRepository.delete(shift);
        return true;
    }

    @Override
    @Transactional
    public StandardWorkShift setDefaultShift(Long shiftId) {
        StandardWorkShift shift = getShiftById(shiftId);
        shift.setDefault(true);
        return shiftRepository.save(shift);
    }

    @Override
    @Transactional
    public StandardWorkShift unsetDefaultShift(Long shiftId) {
        StandardWorkShift shift = getShiftById(shiftId);
        shift.setDefault(false);
        return shiftRepository.save(shift);
    }
} 
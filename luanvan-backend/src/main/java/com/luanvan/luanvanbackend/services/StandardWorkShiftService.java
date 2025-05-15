package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.StandardWorkShiftDTO;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StandardWorkShiftService {
    
    /**
     * Lấy thông tin ca làm việc theo ID
     * @param shiftId ID của ca làm việc
     * @return Thông tin ca làm việc
     */
    StandardWorkShift getShiftById(Long shiftId);
    
    /**
     * Lấy tất cả ca làm việc
     * @return Danh sách ca làm việc
     */
    List<StandardWorkShift> getAllShifts();
    
    /**
     * Lấy danh sách ca làm việc có phân trang
     * @param pageable Thông tin phân trang
     * @return Danh sách ca làm việc có phân trang
     */
    Page<StandardWorkShift> getAllShifts(Pageable pageable);
    
    /**
     * Lấy danh sách ca làm việc theo phòng khám
     * @param clinicId ID của phòng khám
     * @return Danh sách ca làm việc thuộc phòng khám
     */
    List<StandardWorkShift> getShiftsByClinic(Long clinicId);
    
    /**
     * Lấy danh sách ca làm việc theo ngày trong tuần
     * @param dayOfWeek Ngày trong tuần (0-6, 0 là Chủ nhật)
     * @return Danh sách ca làm việc
     */
    List<StandardWorkShift> getShiftsByDay(Integer dayOfWeek);
    
    /**
     * Lấy danh sách ca làm việc mặc định
     * @return Danh sách ca làm việc mặc định
     */
    List<StandardWorkShift> getDefaultShifts();
    
    /**
     * Tạo ca làm việc mới
     * @param shiftDTO Thông tin ca làm việc
     * @return Ca làm việc đã được tạo
     */
    StandardWorkShift createShift(StandardWorkShiftDTO shiftDTO);
    
    /**
     * Cập nhật thông tin ca làm việc
     * @param shiftId ID của ca làm việc
     * @param shiftDTO Thông tin cập nhật
     * @return Thông tin ca làm việc sau khi cập nhật
     */
    StandardWorkShift updateShift(Long shiftId, StandardWorkShiftDTO shiftDTO);
    
    /**
     * Xóa ca làm việc
     * @param shiftId ID của ca làm việc
     * @return true nếu xóa thành công
     */
    boolean deleteShift(Long shiftId);
    
    /**
     * Đặt ca làm việc là mặc định
     * @param shiftId ID của ca làm việc
     * @return Ca làm việc đã được cập nhật
     */
    StandardWorkShift setDefaultShift(Long shiftId);
    
    /**
     * Bỏ đặt ca làm việc là mặc định
     * @param shiftId ID của ca làm việc
     * @return Ca làm việc đã được cập nhật
     */
    StandardWorkShift unsetDefaultShift(Long shiftId);
} 
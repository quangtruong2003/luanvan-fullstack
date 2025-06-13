package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AvailabilitySlotService {
    
    /**
     * Lấy thông tin khung giờ khả dụng theo ID
     * @param slotId ID của khung giờ
     * @return Thông tin khung giờ
     */
    AvailabilitySlot getSlotById(Long slotId);
    
    /**
     * Lấy danh sách khung giờ theo bác sĩ
     * @param doctorId ID của bác sĩ
     * @return Danh sách khung giờ khả dụng
     */
    List<AvailabilitySlot> getSlotsByDoctor(Long doctorId);
    
    /**
     * Lấy danh sách khung giờ có phân trang theo bác sĩ
     * @param doctorId ID của bác sĩ
     * @param pageable Thông tin phân trang
     * @return Danh sách khung giờ có phân trang
     */
    Page<AvailabilitySlot> getSlotsByDoctor(Long doctorId, Pageable pageable);
    
    /**
     * Lấy danh sách khung giờ AVAILABLE có phân trang theo bác sĩ  
     * @param doctorId ID của bác sĩ
     * @param pageable Thông tin phân trang
     * @return Danh sách khung giờ AVAILABLE có phân trang
     */
    Page<AvailabilitySlot> getAvailableSlotsByDoctor(Long doctorId, Pageable pageable);
    
    /**
     * Lấy TẤT CẢ khung giờ có phân trang theo bác sĩ (bao gồm đã đặt) - Admin only
     * @param doctorId ID của bác sĩ
     * @param pageable Thông tin phân trang  
     * @return Danh sách TẤT CẢ khung giờ có phân trang
     */
    Page<AvailabilitySlot> getAllSlotsByDoctor(Long doctorId, Pageable pageable);
    
    /**
     * Lấy danh sách khung giờ theo bác sĩ và ngày
     * @param doctorId ID của bác sĩ
     * @param date Ngày cần tìm
     * @return Danh sách khung giờ khả dụng
     */
    List<AvailabilitySlot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date);
    
    /**
     * Lấy danh sách khung giờ AVAILABLE theo bác sĩ và ngày
     * @param doctorId ID của bác sĩ
     * @param date Ngày cần tìm
     * @return Danh sách khung giờ AVAILABLE
     */
    List<AvailabilitySlot> getAvailableSlotsByDoctorAndDate(Long doctorId, LocalDate date);
    
    /**
     * Lấy danh sách khung giờ theo khoảng thời gian
     * @param doctorId ID của bác sĩ
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách khung giờ khả dụng
     */
    List<AvailabilitySlot> getSlotsByDateRange(Long doctorId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Lấy danh sách khung giờ AVAILABLE theo khoảng thời gian
     * @param doctorId ID của bác sĩ
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách khung giờ AVAILABLE
     */
    List<AvailabilitySlot> getAvailableSlotsInDateRange(Long doctorId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Tìm khung giờ khả dụng theo chuyên khoa và ngày
     * @param specialtyId ID của chuyên khoa
     * @param date Ngày cần tìm
     * @return Danh sách khung giờ khả dụng
     */
    List<AvailabilitySlot> findAvailableSlotsBySpecialtyAndDate(Long specialtyId, LocalDate date);
    
    /**
     * Lấy danh sách khung giờ theo phòng khám
     * @param clinicId ID của phòng khám
     * @return Danh sách khung giờ khả dụng
     */
    List<AvailabilitySlot> getSlotsByClinic(Long clinicId);
    
    /**
     * Tạo mới một khung giờ khả dụng
     * @param slotDTO Thông tin khung giờ
     * @return Khung giờ đã được tạo
     */
    AvailabilitySlot createSlot(AvailabilitySlotDTO slotDTO);
    
    /**
     * Tạo nhiều khung giờ khả dụng cùng lúc
     * @param slotDTOs Danh sách thông tin khung giờ
     * @return Danh sách khung giờ đã được tạo
     */
    List<AvailabilitySlot> createMultipleSlots(List<AvailabilitySlotDTO> slotDTOs);
    
    /**
     * Tạo nhiều khung giờ khả dụng cho một bác sĩ và phòng khám cụ thể
     * @param doctorId ID của bác sĩ
     * @param clinicId ID của phòng khám (có thể null)
     * @param slots Danh sách thông tin khung giờ cần tạo
     * @return Danh sách khung giờ đã được tạo
     */
    List<AvailabilitySlot> createBulkSlots(Long doctorId, Long clinicId, List<AvailabilitySlotDTO> slots);
    
    /**
     * Cập nhật thông tin khung giờ
     * @param slotId ID của khung giờ
     * @param slotDTO Thông tin cập nhật
     * @return Khung giờ sau khi cập nhật
     */
    AvailabilitySlot updateSlot(Long slotId, AvailabilitySlotDTO slotDTO);
    
    /**
     * Cập nhật trạng thái khung giờ
     * @param slotId ID của khung giờ
     * @param status Trạng thái mới
     * @return Khung giờ sau khi cập nhật
     */
    AvailabilitySlot updateSlotStatus(Long slotId, AvailabilitySlot.SlotStatus status);
    
    /**
     * Kiểm tra xem khung giờ có bị trùng lặp không
     * @param doctorId ID của bác sĩ
     * @param date Ngày
     * @param startTime Giờ bắt đầu
     * @param endTime Giờ kết thúc
     * @return true nếu trùng lặp với khung giờ đã tồn tại
     */
    boolean isSlotOverlapping(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime);
    
    /**
     * Xóa khung giờ
     * @param slotId ID của khung giờ
     * @return true nếu xóa thành công
     */
    boolean deleteSlot(Long slotId);
    
    /**
     * Tìm kiếm khung giờ theo nhiều tiêu chí
     * @param doctorId ID của bác sĩ (có thể null)
     * @param clinicId ID của phòng khám (có thể null)
     * @param date Ngày cần tìm (có thể null)
     * @param status Trạng thái khung giờ (có thể null)
     * @return Danh sách khung giờ tìm được
     */
    List<AvailabilitySlot> searchSlots(Long doctorId, Long clinicId, LocalDate date, AvailabilitySlot.SlotStatus status);
} 
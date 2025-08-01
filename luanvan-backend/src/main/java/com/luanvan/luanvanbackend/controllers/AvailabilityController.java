package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.dto.SlotIdRequestDTO;
import com.luanvan.luanvanbackend.dto.StandardWorkShiftDTO;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import com.luanvan.luanvanbackend.services.AvailabilitySlotService;
import com.luanvan.luanvanbackend.services.StandardWorkShiftService;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilitySlotService availabilitySlotService;
    private final StandardWorkShiftService standardWorkShiftService;

    // ===========================================
    // AVAILABILITY SLOT ENDPOINTS
    // ===========================================

    /**
     * Lấy thông tin khung giờ theo ID (public)
     */
    @GetMapping("/slots/{slotId}")
    public ResponseEntity<AvailabilitySlot> getSlotById(@PathVariable Long slotId) {
        AvailabilitySlot slot = availabilitySlotService.getSlotById(slotId);
        return ResponseEntity.ok(slot);
    }

    /**
     * Tìm kiếm khung giờ theo nhiều tiêu chí (public)
     */
    @GetMapping("/slots")
    public ResponseEntity<List<AvailabilitySlot>> searchSlots(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long clinicId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AvailabilitySlot.SlotStatus status) {
        // Nếu không có status được chỉ định, mặc định chỉ lấy AVAILABLE slots
        AvailabilitySlot.SlotStatus finalStatus = (status != null) ? status : AvailabilitySlot.SlotStatus.AVAILABLE;
        List<AvailabilitySlot> slots = availabilitySlotService.searchSlots(doctorId, clinicId, date, finalStatus);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy danh sách khung giờ theo bác sĩ (public) - chỉ slots khả dụng
     */
    @GetMapping("/slots/doctor/{doctorId}")
    public ResponseEntity<Page<AvailabilitySlot>> getSlotsByDoctor(
            @PathVariable Long doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AvailabilitySlot> slots = availabilitySlotService.getAvailableSlotsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy danh sách khung giờ theo bác sĩ và ngày (public) - chỉ slots khả dụng
     */
    @GetMapping("/slots/doctor/{doctorId}/date/{date}")
    public ResponseEntity<List<AvailabilitySlot>> getSlotsByDoctorAndDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AvailabilitySlot> slots = availabilitySlotService.getAvailableSlotsByDoctorAndDate(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy danh sách khung giờ theo khoảng thời gian (public) - chỉ slots khả dụng
     */
    @GetMapping("/slots/doctor/{doctorId}/range")
    public ResponseEntity<List<AvailabilitySlot>> getSlotsByDateRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AvailabilitySlot> slots = availabilitySlotService.getAvailableSlotsInDateRange(doctorId, startDate, endDate);
        return ResponseEntity.ok(slots);
    }

    /**
     * Tìm khung giờ khả dụng theo chuyên khoa và ngày (public)
     */
    @GetMapping("/slots/specialty/{specialtyId}/date/{date}")
    public ResponseEntity<List<AvailabilitySlot>> findAvailableSlotsBySpecialtyAndDate(
            @PathVariable Long specialtyId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AvailabilitySlot> slots = availabilitySlotService.findAvailableSlotsBySpecialtyAndDate(specialtyId, date);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy danh sách khung giờ theo phòng khám (chỉ Admin)
     */
    @GetMapping("/slots/clinic/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilitySlot>> getSlotsByClinic(@PathVariable Long clinicId) {
        List<AvailabilitySlot> slots = availabilitySlotService.getSlotsByClinic(clinicId);
        return ResponseEntity.ok(slots);
    }

    /**
     * Tạo mới một khung giờ khả dụng (chỉ Admin)
     */
    @PostMapping("/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvailabilitySlot> createSlot(@Valid @RequestBody AvailabilitySlotDTO slotDTO) {
        AvailabilitySlot slot = availabilitySlotService.createSlot(slotDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(slot);
    }

    /**
     * Tạo nhiều khung giờ khả dụng cùng lúc (chỉ Admin)
     */
    @PostMapping("/slots/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilitySlot>> createMultipleSlots(@Valid @RequestBody List<AvailabilitySlotDTO> slotDTOs) {
        List<AvailabilitySlot> slots = availabilitySlotService.createMultipleSlots(slotDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(slots);
    }

    /**
     * Tạo nhiều khung giờ cho bác sĩ (chỉ Admin)
     */
    @PostMapping("/slots/doctor/{doctorId}/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilitySlot>> createBulkSlots(
            @PathVariable Long doctorId,
            @RequestParam(required = false) Long clinicId,
            @Valid @RequestBody List<AvailabilitySlotDTO> slotDTOs) {
        List<AvailabilitySlot> slots = availabilitySlotService.createBulkSlots(doctorId, clinicId, slotDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).body(slots);
    }

    /**
     * Cập nhật thông tin khung giờ (chỉ Admin)
     */
    @PutMapping("/slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvailabilitySlot> updateSlot(
            @PathVariable Long slotId,
            @Valid @RequestBody AvailabilitySlotDTO slotDTO) {
        AvailabilitySlot slot = availabilitySlotService.updateSlot(slotId, slotDTO);
        return ResponseEntity.ok(slot);
    }

    /**
     * Cập nhật trạng thái khung giờ (chỉ Admin)
     */
    @PutMapping("/slots/{slotId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvailabilitySlot> updateSlotStatus(
            @PathVariable Long slotId,
            @RequestParam AvailabilitySlot.SlotStatus status) {
        AvailabilitySlot slot = availabilitySlotService.updateSlotStatus(slotId, status);
        return ResponseEntity.ok(slot);
    }

    /**
     * Xóa khung giờ (chỉ Admin)
     */
    @DeleteMapping("/slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSlot(@PathVariable Long slotId) {
        boolean success = availabilitySlotService.deleteSlot(slotId);
        if (success) {
            return ResponseEntity.ok("Đã xóa khung giờ thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa khung giờ");
        }
    }

    // ===========================================
    // STANDARD WORK SHIFT ENDPOINTS
    // ===========================================

    /**
     * Lấy thông tin ca làm việc theo ID (public)
     */
    @GetMapping("/shifts/{shiftId}")
    public ResponseEntity<StandardWorkShift> getShiftById(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.getShiftById(shiftId);
        return ResponseEntity.ok(shift);
    }

    /**
     * Lấy danh sách tất cả ca làm việc (public)
     */
    @GetMapping("/shifts")
    public ResponseEntity<Page<StandardWorkShift>> getAllShifts(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<StandardWorkShift> shifts = standardWorkShiftService.getAllShifts(pageable);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách ca làm việc theo phòng khám (public)
     */
    @GetMapping("/shifts/clinic/{clinicId}")
    public ResponseEntity<List<StandardWorkShift>> getShiftsByClinic(@PathVariable Long clinicId) {
        List<StandardWorkShift> shifts = standardWorkShiftService.getShiftsByClinic(clinicId);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách ca làm việc theo ngày trong tuần (public)
     */
    @GetMapping("/shifts/day/{dayOfWeek}")
    public ResponseEntity<List<StandardWorkShift>> getShiftsByDay(@PathVariable Integer dayOfWeek) {
        List<StandardWorkShift> shifts = standardWorkShiftService.getShiftsByDay(dayOfWeek);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách ca làm việc mặc định (public)
     */
    @GetMapping("/shifts/default")
    public ResponseEntity<List<StandardWorkShift>> getDefaultShifts() {
        List<StandardWorkShift> shifts = standardWorkShiftService.getDefaultShifts();
        return ResponseEntity.ok(shifts);
    }

    /**
     * Tạo ca làm việc mới (chỉ Admin)
     */
    @PostMapping("/shifts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> createShift(@Valid @RequestBody StandardWorkShiftDTO shiftDTO) {
        StandardWorkShift shift = standardWorkShiftService.createShift(shiftDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(shift);
    }

    /**
     * Cập nhật thông tin ca làm việc (chỉ Admin)
     */
    @PutMapping("/shifts/{shiftId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> updateShift(
            @PathVariable Long shiftId,
            @Valid @RequestBody StandardWorkShiftDTO shiftDTO) {
        StandardWorkShift shift = standardWorkShiftService.updateShift(shiftId, shiftDTO);
        return ResponseEntity.ok(shift);
    }

    /**
     * Xóa ca làm việc (chỉ Admin)
     */
    @DeleteMapping("/shifts/{shiftId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteShift(@PathVariable Long shiftId) {
        boolean success = standardWorkShiftService.deleteShift(shiftId);
        if (success) {
            return ResponseEntity.ok("Đã xóa ca làm việc thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa ca làm việc");
        }
    }

    /**
     * Đặt ca làm việc là mặc định (chỉ Admin)
     */
    @PutMapping("/shifts/{shiftId}/set-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> setDefaultShift(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.setDefaultShift(shiftId);
        return ResponseEntity.ok(shift);
    }

    /**
     * Bỏ đặt ca làm việc là mặc định (chỉ Admin)
     */
    @PutMapping("/shifts/{shiftId}/unset-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> unsetDefaultShift(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.unsetDefaultShift(shiftId);
        return ResponseEntity.ok(shift);
    }

    /**
     * Lấy TẤT CẢ khung giờ theo bác sĩ và ngày - bao gồm đã đặt (chỉ Admin)
     */
    @GetMapping("/admin/slots/doctor/{doctorId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilitySlot>> getAllSlotsByDoctorAndDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AvailabilitySlot> slots = availabilitySlotService.getSlotsByDoctorAndDate(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy TẤT CẢ khung giờ theo bác sĩ - bao gồm đã đặt (chỉ Admin)
     */
    @GetMapping("/admin/slots/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AvailabilitySlot>> getAllSlotsByDoctor(
            @PathVariable Long doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<AvailabilitySlot> slots = availabilitySlotService.getAllSlotsByDoctor(doctorId, pageable);
        return ResponseEntity.ok(slots);
    }

    /**
     * Lấy slot ID dựa trên các thông tin chi tiết (public).
     */
    @PostMapping("/slots/get_slot_id")
    public ResponseEntity<Long> getSlotIdByDetails(@Valid @RequestBody SlotIdRequestDTO requestDTO) {
        Long slotId = availabilitySlotService.getSlotIdByDetails(requestDTO);

        if (slotId != null) {
            return ResponseEntity.ok(slotId);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

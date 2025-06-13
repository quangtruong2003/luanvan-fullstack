package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.StandardWorkShiftDTO;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import com.luanvan.luanvanbackend.services.StandardWorkShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/standard-work-shifts")
@RequiredArgsConstructor
public class StandardWorkShiftController {

    private final StandardWorkShiftService standardWorkShiftService;

    /**
     * Lấy danh sách tất cả ca làm việc tiêu chuẩn có phân trang (public)
     */
    @GetMapping
    public ResponseEntity<Page<StandardWorkShift>> getAllShifts(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<StandardWorkShift> shifts = standardWorkShiftService.getAllShifts(pageable);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách tất cả ca làm việc tiêu chuẩn không phân trang (public)
     */
    @GetMapping("/all")
    public ResponseEntity<List<StandardWorkShift>> getAllShiftsList() {
        List<StandardWorkShift> shifts = standardWorkShiftService.getAllShifts();
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy thông tin chi tiết ca làm việc theo ID (public)
     */
    @GetMapping("/{shiftId}")
    public ResponseEntity<StandardWorkShift> getShiftById(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.getShiftById(shiftId);
        return ResponseEntity.ok(shift);
    }

    /**
     * Lấy danh sách ca làm việc theo phòng khám (public)
     */
    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<StandardWorkShift>> getShiftsByClinic(@PathVariable Long clinicId) {
        List<StandardWorkShift> shifts = standardWorkShiftService.getShiftsByClinic(clinicId);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách ca làm việc theo ngày trong tuần (public)
     * @param dayOfWeek Ngày trong tuần (MONDAY, TUESDAY, ..., SUNDAY)
     */
    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<StandardWorkShift>> getShiftsByDay(@PathVariable DayOfWeek dayOfWeek) {
        // Convert DayOfWeek to Integer (0-6, 0 là Chủ nhật)
        Integer dayNumber = dayOfWeek.getValue() % 7; // MONDAY=1 -> 1, SUNDAY=7 -> 0
        List<StandardWorkShift> shifts = standardWorkShiftService.getShiftsByDay(dayNumber);
        return ResponseEntity.ok(shifts);
    }

    /**
     * Lấy danh sách ca làm việc mặc định (public)
     */
    @GetMapping("/default")
    public ResponseEntity<List<StandardWorkShift>> getDefaultShifts() {
        List<StandardWorkShift> shifts = standardWorkShiftService.getDefaultShifts();
        return ResponseEntity.ok(shifts);
    }

    /**
     * Tạo ca làm việc tiêu chuẩn mới (chỉ Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> createShift(@Valid @RequestBody StandardWorkShiftDTO shiftDTO) {
        System.out.println("🔍 Received StandardWorkShiftDTO: " + shiftDTO);
        try {
            StandardWorkShift shift = standardWorkShiftService.createShift(shiftDTO);
            System.out.println("✅ Created StandardWorkShift: " + shift);
            return ResponseEntity.status(HttpStatus.CREATED).body(shift);
        } catch (Exception e) {
            System.err.println("❌ Error creating StandardWorkShift: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Cập nhật thông tin ca làm việc tiêu chuẩn (chỉ Admin)
     */
    @PutMapping("/{shiftId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> updateShift(
            @PathVariable Long shiftId,
            @Valid @RequestBody StandardWorkShiftDTO shiftDTO) {
        StandardWorkShift shift = standardWorkShiftService.updateShift(shiftId, shiftDTO);
        return ResponseEntity.ok(shift);
    }

    /**
     * Xóa ca làm việc tiêu chuẩn (chỉ Admin)
     */
    @DeleteMapping("/{shiftId}")
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
    @PutMapping("/{shiftId}/set-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> setDefaultShift(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.setDefaultShift(shiftId);
        return ResponseEntity.ok(shift);
    }

    /**
     * Bỏ đặt ca làm việc là mặc định (chỉ Admin)
     */
    @PutMapping("/{shiftId}/unset-default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardWorkShift> unsetDefaultShift(@PathVariable Long shiftId) {
        StandardWorkShift shift = standardWorkShiftService.unsetDefaultShift(shiftId);
        return ResponseEntity.ok(shift);
    }
} 
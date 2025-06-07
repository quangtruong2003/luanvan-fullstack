package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorResponseDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.security.SecurityService;
import com.luanvan.luanvanbackend.services.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final SecurityService securityService;

    /**
     * Lấy danh sách tất cả bác sĩ (có phân trang) - Trả về DTO để tránh circular reference
     */
    @GetMapping
    public ResponseEntity<Page<DoctorResponseDTO>> getAllDoctors(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<DoctorResponseDTO> doctors = doctorService.getAllDoctorsDTO(pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Lấy thông tin chi tiết bác sĩ theo ID
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Lấy thông tin bác sĩ theo ID người dùng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        Doctor doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Tìm kiếm bác sĩ theo tên - Trả về DTO để tránh circular reference
     */
    @GetMapping("/search")
    public ResponseEntity<Page<DoctorResponseDTO>> searchDoctorsByName(
            @RequestParam String name,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<DoctorResponseDTO> doctors = doctorService.searchDoctorsByNameDTO(name, pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Lấy danh sách bác sĩ theo chuyên khoa - Trả về DTO để tránh circular reference
     */
    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<Page<DoctorResponseDTO>> getDoctorsBySpecialty(
            @PathVariable Long specialtyId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<DoctorResponseDTO> doctors = doctorService.getDoctorsBySpecialtyDTO(specialtyId, pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Lấy danh sách bác sĩ theo số năm kinh nghiệm - Trả về DTO để tránh circular reference
     */
    @GetMapping("/experience/{yearsOfExperience}")
    public ResponseEntity<Page<DoctorResponseDTO>> getDoctorsByExperience(
            @PathVariable int yearsOfExperience,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<DoctorResponseDTO> doctors = doctorService.getDoctorsByExperienceDTO(yearsOfExperience, pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Tạo hồ sơ bác sĩ mới (chỉ Admin)
     */
    @PostMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> createDoctor(
            @PathVariable Long userId,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        Doctor doctor = doctorService.createDoctor(userId, doctorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(doctor);
    }

    /**
     * Cập nhật thông tin bác sĩ (Admin hoặc chính bác sĩ đó)
     */
    @PutMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.canUpdateDoctor(#doctorId)")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorUpdateDTO doctorUpdateDTO) {
        Doctor doctor = doctorService.updateDoctor(doctorId, doctorUpdateDTO);
        return ResponseEntity.ok(doctor);
    }



    /**
     * Gán chuyên khoa cho bác sĩ (chỉ Admin)
     */
    @PostMapping("/{doctorId}/specialties/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> assignSpecialty(
            @PathVariable Long doctorId,
            @PathVariable Long specialtyId,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        boolean success = doctorService.assignSpecialty(doctorId, specialtyId, isPrimary);
        if (success) {
            return ResponseEntity.ok("Đã gán chuyên khoa thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể gán chuyên khoa");
        }
    }

    /**
     * Xóa chuyên khoa khỏi bác sĩ (chỉ Admin)
     */
    @DeleteMapping("/{doctorId}/specialties/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> removeSpecialty(
            @PathVariable Long doctorId,
            @PathVariable Long specialtyId) {
        boolean success = doctorService.removeSpecialty(doctorId, specialtyId);
        if (success) {
            return ResponseEntity.ok("Đã xóa chuyên khoa thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa chuyên khoa");
        }
    }

    /**
     * Lấy danh sách chuyên khoa của bác sĩ
     */
    @GetMapping("/{doctorId}/specialties")
    public ResponseEntity<List<Object>> getDoctorSpecialties(@PathVariable Long doctorId) {
        List<Object> specialties = doctorService.getDoctorSpecialties(doctorId);
        return ResponseEntity.ok(specialties);
    }
} 
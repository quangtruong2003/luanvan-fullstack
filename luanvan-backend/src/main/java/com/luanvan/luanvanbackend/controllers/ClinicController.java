package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.dto.SpecialtyDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.services.ClinicService;
import com.luanvan.luanvanbackend.services.SpecialtyService;
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
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final ClinicService clinicService;
    private final SpecialtyService specialtyService;

    /**
     * Lấy danh sách tất cả phòng khám (public)
     */
    @GetMapping
    public ResponseEntity<Page<ClinicResponseDTO>> getAllClinics(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(clinicService.getAllClinicsDTO(pageable));
    }

    /**
     * Lấy thông tin chi tiết phòng khám theo ID (public)
     */
    @GetMapping("/{clinicId}")
    public ResponseEntity<ClinicResponseDTO> getClinicById(@PathVariable Long clinicId) {
        return ResponseEntity.ok(clinicService.getClinicResponseDTOById(clinicId));
    }

    /**
     * Tìm kiếm phòng khám theo tên (public)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ClinicResponseDTO>> searchClinicsByName(
            @RequestParam String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(clinicService.searchClinicsByNameDTO(name, pageable));
    }

    /**
     * Tạo phòng khám mới (chỉ Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Clinic> createClinic(@Valid @RequestBody ClinicDTO clinicDTO) {
        Clinic clinic = clinicService.createClinic(clinicDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(clinic);
    }

    /**
     * Cập nhật thông tin phòng khám (chỉ Admin)
     */
    @PutMapping("/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Clinic> updateClinic(
            @PathVariable Long clinicId,
            @Valid @RequestBody ClinicUpdateDTO clinicUpdateDTO) {
        Clinic clinic = clinicService.updateClinic(clinicId, clinicUpdateDTO);
        return ResponseEntity.ok(clinic);
    }

    /**
     * Cập nhật logo phòng khám (chỉ Admin)
     */
    @PutMapping("/{clinicId}/logo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Clinic> updateLogo(
            @PathVariable Long clinicId,
            @RequestParam String logoURL) {
        Clinic clinic = clinicService.updateLogo(clinicId, logoURL);
        return ResponseEntity.ok(clinic);
    }

    /**
     * Xóa phòng khám (chỉ Admin)
     */
    @DeleteMapping("/{clinicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteClinic(@PathVariable Long clinicId) {
        boolean success = clinicService.deleteClinic(clinicId);
        if (success) {
            return ResponseEntity.ok("Đã xóa phòng khám thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa phòng khám");
        }
    }

    // === SPECIALTY MANAGEMENT FOR CLINIC ===

    /**
     * Lấy danh sách chuyên khoa của phòng khám
     */
    @GetMapping("/{clinicId}/specialties")
    public ResponseEntity<List<Specialty>> getSpecialtiesByClinic(@PathVariable Long clinicId) {
        List<Specialty> specialties = specialtyService.getSpecialtiesByClinic(clinicId);
        return ResponseEntity.ok(specialties);
    }

    /**
     * Tạo chuyên khoa mới cho phòng khám (chỉ Admin)
     */
    @PostMapping("/{clinicId}/specialties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> createSpecialtyForClinic(
            @PathVariable Long clinicId,
            @RequestBody SpecialtyDTO specialtyDTO) {
        // Đặt clinicId từ path parameter TRƯỚC khi validate
        specialtyDTO.setClinicId(clinicId);
        
        // Manual validation để tránh @Valid chạy trước setClinicId
        if (specialtyDTO.getName() == null || specialtyDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên chuyên khoa không được để trống");
        }
        if (specialtyDTO.getName().length() < 2 || specialtyDTO.getName().length() > 100) {
            throw new IllegalArgumentException("Tên chuyên khoa phải từ 2-100 ký tự");
        }
        if (specialtyDTO.getDescription() != null && specialtyDTO.getDescription().length() > 500) {
            throw new IllegalArgumentException("Mô tả không được vượt quá 500 ký tự");
        }
        
        Specialty specialty = specialtyService.createSpecialty(specialtyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(specialty);
    }

    /**
     * Cập nhật chuyên khoa của phòng khám (chỉ Admin)
     */
    @PutMapping("/{clinicId}/specialties/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> updateSpecialtyForClinic(
            @PathVariable Long clinicId,
            @PathVariable Long specialtyId,
            @Valid @RequestBody SpecialtyDTO specialtyDTO) {
        // Đảm bảo specialty thuộc về clinic này
        Specialty existingSpecialty = specialtyService.getSpecialtyById(specialtyId);
        if (!existingSpecialty.getClinic().getClinicId().equals(clinicId)) {
            return ResponseEntity.badRequest().build();
        }
        
        Specialty specialty = specialtyService.updateSpecialty(specialtyId, specialtyDTO);
        return ResponseEntity.ok(specialty);
    }

    /**
     * Xóa chuyên khoa của phòng khám (chỉ Admin)
     */
    @DeleteMapping("/{clinicId}/specialties/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSpecialtyFromClinic(
            @PathVariable Long clinicId,
            @PathVariable Long specialtyId) {
        // Đảm bảo specialty thuộc về clinic này
        Specialty existingSpecialty = specialtyService.getSpecialtyById(specialtyId);
        if (!existingSpecialty.getClinic().getClinicId().equals(clinicId)) {
            return ResponseEntity.badRequest().body("Chuyên khoa không thuộc về phòng khám này");
        }
        
        boolean success = specialtyService.deleteSpecialty(specialtyId);
        if (success) {
            return ResponseEntity.ok("Đã xóa chuyên khoa thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa chuyên khoa");
        }
    }
} 
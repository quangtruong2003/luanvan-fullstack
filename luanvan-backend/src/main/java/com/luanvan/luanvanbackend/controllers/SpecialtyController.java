package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.SpecialtyDTO;
import com.luanvan.luanvanbackend.dto.SpecialtyResponseDTO;
import com.luanvan.luanvanbackend.entities.Specialty;
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
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    /**
     * Lấy danh sách tất cả chuyên khoa (public)
     */
    @GetMapping
    public ResponseEntity<Page<SpecialtyResponseDTO>> getAllSpecialties(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<SpecialtyResponseDTO> specialties = specialtyService.getAllSpecialtiesDTO(pageable);
        return ResponseEntity.ok(specialties);
    }

    /**
     * Lấy danh sách tất cả chuyên khoa không phân trang (public)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Specialty>> getAllSpecialtiesList() {
        List<Specialty> specialties = specialtyService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }

    /**
     * Lấy thông tin chi tiết chuyên khoa theo ID (public)
     */
    @GetMapping("/{specialtyId}")
    public ResponseEntity<Specialty> getSpecialtyById(@PathVariable Long specialtyId) {
        Specialty specialty = specialtyService.getSpecialtyById(specialtyId);
        return ResponseEntity.ok(specialty);
    }

    /**
     * Lấy danh sách chuyên khoa theo phòng khám (public)
     */
    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<Specialty>> getSpecialtiesByClinic(@PathVariable Long clinicId) {
        List<Specialty> specialties = specialtyService.getSpecialtiesByClinic(clinicId);
        return ResponseEntity.ok(specialties);
    }

    /**
     * Tìm kiếm chuyên khoa theo tên (public)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Specialty>> searchSpecialtiesByName(
            @RequestParam String name,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Specialty> specialties = specialtyService.searchSpecialtiesByName(name, pageable);
        return ResponseEntity.ok(specialties);
    }

    /**
     * Tạo chuyên khoa mới (chỉ Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> createSpecialty(@Valid @RequestBody SpecialtyDTO specialtyDTO) {
        Specialty specialty = specialtyService.createSpecialty(specialtyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(specialty);
    }

    /**
     * Cập nhật thông tin chuyên khoa (chỉ Admin)
     */
    @PutMapping("/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Specialty> updateSpecialty(
            @PathVariable Long specialtyId,
            @Valid @RequestBody SpecialtyDTO specialtyDTO) {
        Specialty specialty = specialtyService.updateSpecialty(specialtyId, specialtyDTO);
        return ResponseEntity.ok(specialty);
    }

    /**
     * Xóa chuyên khoa (chỉ Admin)
     */
    @DeleteMapping("/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteSpecialty(@PathVariable Long specialtyId) {
        boolean success = specialtyService.deleteSpecialty(specialtyId);
        if (success) {
            return ResponseEntity.ok("Đã xóa chuyên khoa thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa chuyên khoa");
        }
    }
} 
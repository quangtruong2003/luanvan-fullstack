package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorResponseDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.security.SecurityService;
import com.luanvan.luanvanbackend.services.DoctorService;
import com.luanvan.luanvanbackend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final SecurityService securityService;
    private final UserService userService;

    /**
     * Lấy danh sách tất cả bác sĩ (có phân trang) - Trả về DTO để tránh circular reference
     */
    @GetMapping({"", "/"})
    public ResponseEntity<Page<DoctorResponseDTO>> getAllDoctors(
            @PageableDefault(size = 10, sort = "user.fullName") Pageable pageable) {
        Page<DoctorResponseDTO> doctors = doctorService.getAllDoctorsDTO(pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Lấy danh sách chuyên khoa của bác sĩ hiện tại
     * Admin có thể truyền doctorId qua query parameter
     */
    @GetMapping("/my-specialties")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Object>> getMySpecialties(
            Authentication auth,
            @RequestParam(required = false) Long doctorId) {
        try {
            // Get current user by email from authentication
            String userEmail = auth.getName();
            System.out.println("🔍 [DEBUG] Getting specialties for doctor with email: " + userEmail);
            
            if (userEmail == null || userEmail.trim().isEmpty()) {
                System.out.println("❌ [ERROR] No user email in authentication");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            User currentUser;
            try {
                currentUser = userService.getUserByEmail(userEmail);
            if (currentUser == null) {
                System.out.println("❌ [ERROR] User not found with email: " + userEmail);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
            } catch (Exception e) {
                System.out.println("❌ [ERROR] Error finding user with email: " + userEmail + " - " + e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            System.out.println("✅ [DEBUG] Found user: " + currentUser.getUserId() + " - " + currentUser.getFullName());
            
            com.luanvan.luanvanbackend.entities.Doctor doctor;
            try {
                // If admin provides doctorId, use it; otherwise use current user's doctor profile
                if (doctorId != null && currentUser.getRole().getRoleName().equals("ADMIN")) {
                    System.out.println("🔍 [DEBUG] Admin requesting doctor ID: " + doctorId);
                    doctor = doctorService.getDoctorById(doctorId);
                } else {
                    doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
                }
            if (doctor == null) {
                System.out.println("❌ [ERROR] Doctor profile not found for user: " + currentUser.getUserId());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
            } catch (com.luanvan.luanvanbackend.exception.ResourceNotFoundException e) {
                System.out.println("❌ [ERROR] Doctor profile not found for user: " + currentUser.getUserId() + " - " + e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            } catch (Exception e) {
                System.out.println("❌ [ERROR] Error finding doctor for user: " + currentUser.getUserId() + " - " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            
            System.out.println("✅ [DEBUG] Found doctor: " + doctor.getDoctorId());
            
            List<Object> specialties = doctorService.getDoctorSpecialties(doctor.getDoctorId());
            System.out.println("✅ [DEBUG] Found " + (specialties != null ? specialties.size() : 0) + " specialties");
            
            if (specialties == null) {
                specialties = List.of(); // Return empty list instead of null
            }
            
            return ResponseEntity.ok(specialties);
        } catch (Exception e) {
            System.err.println("❌ [ERROR] Unexpected error in getMySpecialties: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy thông tin chi tiết bác sĩ theo ID
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable Long doctorId) {
        DoctorResponseDTO doctor = doctorService.getDoctorResponseDTOById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Lấy thông tin bác sĩ theo ID người dùng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorResponseDTO> getDoctorByUserId(@PathVariable Long userId) {
        DoctorResponseDTO doctor = doctorService.getDoctorResponseDTOByUserId(userId);
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
    public ResponseEntity<DoctorResponseDTO> createDoctor(
            @PathVariable Long userId,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        // Fetch User entity from database instead of creating new one
        User user = userService.getUserById(userId);
        DoctorResponseDTO doctor = doctorService.createDoctorReturnDTO(user, doctorDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(doctor);
    }

    /**
     * Cập nhật thông tin bác sĩ (Admin hoặc chính bác sĩ đó)
     */
    @PutMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.canUpdateDoctor(#doctorId)")
    public ResponseEntity<DoctorResponseDTO> updateDoctor(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorUpdateDTO doctorUpdateDTO) {
        DoctorResponseDTO doctor = doctorService.updateDoctorReturnDTO(doctorId, doctorUpdateDTO);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Xóa bác sĩ (chỉ Admin)
     */
    @DeleteMapping("/{doctorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long doctorId) {
        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.ok("Đã xóa bác sĩ thành công");
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
        doctorService.assignSpecialty(doctorId, specialtyId, isPrimary);
        return ResponseEntity.ok("Đã gán chuyên khoa thành công");
    }

    /**
     * Xóa chuyên khoa khỏi bác sĩ (chỉ Admin)
     */
    @DeleteMapping("/{doctorId}/specialties/{specialtyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> removeSpecialty(
            @PathVariable Long doctorId,
            @PathVariable Long specialtyId) {
        doctorService.removeSpecialty(doctorId, specialtyId);
        return ResponseEntity.ok("Đã xóa chuyên khoa thành công");
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
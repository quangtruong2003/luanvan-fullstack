package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.dto.AvailabilitySlotResponseDTO;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.mappers.AvailabilitySlotMapper;
import com.luanvan.luanvanbackend.services.AvailabilitySlotService;
import com.luanvan.luanvanbackend.services.DoctorService;
import com.luanvan.luanvanbackend.services.SpecialtyService;
import com.luanvan.luanvanbackend.services.StandardWorkShiftService;
import com.luanvan.luanvanbackend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor-schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doctor Schedule Management", description = "APIs quản lý lịch làm việc của bác sĩ")
@SecurityRequirement(name = "Bearer Authentication")
public class DoctorScheduleController {

    private final AvailabilitySlotService availabilitySlotService;
    private final DoctorService doctorService;
    private final UserService userService;
    private final StandardWorkShiftService standardWorkShiftService;
    private final SpecialtyService specialtyService;
    private final AvailabilitySlotMapper availabilitySlotMapper;

    /**
     * Helper method để lấy user hiện tại từ authentication
     * Bây giờ auth.getName() sẽ luôn là email
     */
    private User getCurrentUserFromAuth(Authentication auth) {
        String email = auth.getName();
        if (email == null) {
            throw new RuntimeException("Không thể lấy email từ thông tin xác thực.");
        }
        return userService.getUserByEmail(email);
    }

    @Operation(summary = "Lấy lịch làm việc của tôi")
    @GetMapping("/my-schedule")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMySchedule(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 50) Pageable pageable) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            if (startDate == null) startDate = LocalDate.now();
            if (endDate == null) endDate = startDate.plusDays(30);
            
            List<AvailabilitySlot> slots = availabilitySlotService
                .getAvailableSlotsInDateRange(doctor.getDoctorId(), startDate, endDate);
            
            List<AvailabilitySlotResponseDTO> slotDTOs = availabilitySlotMapper.toResponseDTOList(slots);
            
            Map<String, Object> response = new HashMap<>();
            response.put("slots", slotDTOs);
            response.put("doctorId", doctor.getDoctorId());
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting my schedule: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Lấy các slot khả dụng của tôi")
    @GetMapping("/my-availability")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getMyAvailabilitySlots(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor;
            
            // Xử lý cho admin với doctorId parameter
            if (currentUser.getRole().getRoleName().equals("ADMIN")) {
                // Admin có thể xem slots của bất kỳ doctor nào nếu có doctorId
                // Nếu không có doctorId, sẽ lỗi vì admin không có doctor profile
                throw new RuntimeException("Admin cần chỉ định doctorId để xem availability slots");
            } else {
                doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            }
            
            if (startDate == null) startDate = LocalDate.now();
            if (endDate == null) endDate = startDate.plusDays(30);
            
            List<AvailabilitySlot> slots = availabilitySlotService
                .getSlotsByDoctorAndDateRange(doctor.getDoctorId(), startDate, endDate);
            
            List<AvailabilitySlotResponseDTO> responseDTOs = availabilitySlotMapper.toResponseDTOList(slots);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Error getting my availability slots: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Tạo slot khả dụng mới")
    @PostMapping("/my-availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> createMyAvailabilitySlot(
            Authentication auth,
            @Valid @RequestBody AvailabilitySlotDTO slotDTO) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Set doctor ID from current user
            slotDTO.setDoctorId(doctor.getDoctorId());
            
            AvailabilitySlot slot = availabilitySlotService.createSlot(slotDTO);
            AvailabilitySlotResponseDTO responseDTO = availabilitySlotMapper.toResponseDTO(slot);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            log.error("Error creating my availability slot: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Cập nhật slot khả dụng")
    @PutMapping("/my-availability/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> updateMyAvailabilitySlot(
            Authentication auth,
            @PathVariable Long slotId,
            @Valid @RequestBody AvailabilitySlotDTO slotDTO) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Verify slot belongs to current doctor
            AvailabilitySlot existingSlot = availabilitySlotService.getSlotById(slotId);
            if (!existingSlot.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            AvailabilitySlot slot = availabilitySlotService.updateSlot(slotId, slotDTO);
            AvailabilitySlotResponseDTO responseDTO = availabilitySlotMapper.toResponseDTO(slot);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error updating my availability slot: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Xóa slot khả dụng")
    @DeleteMapping("/my-availability/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<String> deleteMyAvailabilitySlot(
            Authentication auth,
            @PathVariable Long slotId) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Verify slot belongs to current doctor
            AvailabilitySlot existingSlot = availabilitySlotService.getSlotById(slotId);
            if (!existingSlot.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            boolean success = availabilitySlotService.deleteSlot(slotId);
            if (success) {
                return ResponseEntity.ok("Đã xóa slot thành công");
            } else {
                return ResponseEntity.badRequest().body("Không thể xóa slot");
            }
        } catch (Exception e) {
            log.error("Error deleting my availability slot: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Bật/tắt trạng thái slot")
    @PutMapping("/my-availability/{slotId}/toggle")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> toggleSlotAvailability(
            Authentication auth,
            @PathVariable Long slotId,
            @RequestBody Map<String, Boolean> request) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Verify slot belongs to current doctor
            AvailabilitySlot existingSlot = availabilitySlotService.getSlotById(slotId);
            if (!existingSlot.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Boolean isAvailable = request.get("isAvailable");
            AvailabilitySlot.SlotStatus newStatus = (isAvailable != null && isAvailable) 
                ? AvailabilitySlot.SlotStatus.AVAILABLE 
                : AvailabilitySlot.SlotStatus.CANCELLED_BY_CLINIC;
            
            AvailabilitySlot slot = availabilitySlotService.updateSlotStatus(slotId, newStatus);
            AvailabilitySlotResponseDTO responseDTO = availabilitySlotMapper.toResponseDTO(slot);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error toggling slot availability: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Tạo slots tự động từ ca làm việc")
    @PostMapping("/bulk-from-work-shifts")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> createBulkSlotsFromWorkShifts(
            Authentication auth,
            @RequestBody Map<String, Object> request) {
          try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Enhanced validation và parsing with null checks
            if (request.get("specialtyId") == null) {
                throw new IllegalArgumentException("specialtyId là bắt buộc");
            }
            if (request.get("clinicId") == null) {
                throw new IllegalArgumentException("clinicId là bắt buộc");
            }
            
            Long specialtyId = Long.valueOf(request.get("specialtyId").toString());
            Long clinicId = Long.valueOf(request.get("clinicId").toString());
            
            // Set default date range if not provided
            LocalDate startDate = LocalDate.now();
            LocalDate endDate = startDate.plusDays(30);
            
            if (request.get("startDate") != null) {
                startDate = LocalDate.parse(request.get("startDate").toString());
            }
            if (request.get("endDate") != null) {
                endDate = LocalDate.parse(request.get("endDate").toString());
            }
            
            Integer slotDurationMinutes = 30; // Default 30 minutes
            if (request.containsKey("slotDurationMinutes") && request.get("slotDurationMinutes") != null) {
                slotDurationMinutes = Integer.valueOf(request.get("slotDurationMinutes").toString());
            }
            
            Boolean overwrite = Boolean.valueOf(request.getOrDefault("overwrite", false).toString());
            
            // Validation
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Ngày bắt đầu không thể sau ngày kết thúc");
            }
            
            if (slotDurationMinutes < 15 || slotDurationMinutes > 120) {
                throw new IllegalArgumentException("Thời lượng slot phải từ 15-120 phút");
            }
            
            // Get specialty
            Specialty specialty = specialtyService.getSpecialtyById(specialtyId);
            if (specialty == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy chuyên khoa với ID: " + specialtyId);
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Get work shifts for the clinic
            List<StandardWorkShift> workShifts = standardWorkShiftService.getShiftsByClinic(clinicId);
            
            if (workShifts.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Không tìm thấy ca làm việc cho phòng khám này");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            int createdSlotsCount = 0;
            int skippedSlotsCount = 0;
            List<String> errors = new ArrayList<>();
            LocalDate currentDate = startDate;
            
            // Nếu overwrite, xóa các slot auto-generated cũ trước khi tạo mới
            if (overwrite) {
                try {
                    availabilitySlotService.deleteAutoGeneratedSlotsByDoctorSpecialtyAndDateRange(
                        doctor.getDoctorId(), specialtyId, startDate, endDate);
                    log.info("Đã xóa các slot auto-generated cũ cho doctor {} specialty {} trong khoảng {}-{}", 
                        doctor.getDoctorId(), specialtyId, startDate, endDate);
                } catch (Exception e) {
                    log.warn("Không thể xóa slot auto-generated cũ: {}", e.getMessage());
                }
            }

            // Xóa các slot đã hết hạn trước khi tạo mới
            try {
                availabilitySlotService.deleteExpiredSlots();
            } catch (Exception e) {
                log.warn("Không thể xóa slot hết hạn: {}", e.getMessage());
            }
            
            while (!currentDate.isAfter(endDate)) {
                for (StandardWorkShift shift : workShifts) {
                    if (shift.getDayOfWeek() == currentDate.getDayOfWeek()) {
                        // Create slots for this shift
                        LocalTime slotStartTime = shift.getStartTime();
                        while (slotStartTime.isBefore(shift.getEndTime())) {
                            final LocalTime finalSlotStartTime = slotStartTime; // Make effectively final
                            LocalTime slotEndTime = slotStartTime.plusMinutes(slotDurationMinutes);
                            if (slotEndTime.isAfter(shift.getEndTime())) {
                                break; // Slot would exceed shift end time
                            }
                            
                            try {
                                // Check if slot already exists (if not overwriting)
                                if (!overwrite) {
                                    List<AvailabilitySlot> existingSlots = availabilitySlotService
                                        .getSlotsByDoctorAndDateRange(doctor.getDoctorId(), currentDate, currentDate);
                                    
                                    boolean slotExists = existingSlots.stream()
                                        .anyMatch(slot -> slot.getStartTime().equals(finalSlotStartTime));
                                    
                                    if (slotExists) {
                                        skippedSlotsCount++;
                                        slotStartTime = slotEndTime;
                                        continue;
                                    }
                                }
                                
                                // Create slot using DTO for now (will enhance service layer later)
                                AvailabilitySlotDTO slotDTO = new AvailabilitySlotDTO(
                                    doctor.getDoctorId(),
                                    currentDate,
                                    slotStartTime,
                                    slotEndTime,
                                    "AVAILABLE", // Default enabled
                                    clinicId,
                                    specialtyId // Bổ sung trường này cho đúng constructor
                                );
                                
                                AvailabilitySlot createdSlot = availabilitySlotService.createSlot(slotDTO);
                                
                                // Set specialty and other enhanced fields after creation
                                createdSlot.setSpecialty(specialty);
                                createdSlot.setSlotDurationMinutes(slotDurationMinutes);
                                createdSlot.setAutoGenerated(true);
                                createdSlot.setCreatedFromShiftId(shift.getShiftId());
                                createdSlot.setNotes("Tự động tạo từ ca làm việc: " + shift.getShiftName());
                                
                                // Save the updated slot
                                availabilitySlotService.saveSlot(createdSlot);
                                
                                createdSlotsCount++;
                                
                            } catch (Exception e) {
                                String errorMsg = String.format("Lỗi tạo slot %s %s: %s", 
                                    currentDate, slotStartTime, e.getMessage());
                                errors.add(errorMsg);
                                log.warn(errorMsg);
                            }
                            
                            slotStartTime = slotEndTime;
                        }
                    }
                }
                currentDate = currentDate.plusDays(1);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo %d slots, bỏ qua %d slots đã tồn tại", 
                createdSlotsCount, skippedSlotsCount));
            response.put("createdSlotsCount", createdSlotsCount);
            response.put("skippedSlotsCount", skippedSlotsCount);
            response.put("totalWorkShifts", workShifts.size());
            response.put("dateRange", String.format("%s đến %s", startDate, endDate));
            response.put("specialtyId", specialtyId);
            response.put("specialtyName", specialty.getName());
            
            if (!errors.isEmpty()) {
                response.put("errors", errors);
                response.put("hasErrors", true);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating bulk slots from work shifts: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tạo slots: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Kiểm tra xung đột slots giữa các chuyên khoa")
    @PostMapping("/check-conflicts")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> checkSlotConflicts(
            Authentication auth,
            @RequestBody Map<String, Object> request) {
          try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            // Validate required fields
            if (request.get("slotTime") == null) {
                throw new IllegalArgumentException("slotTime là bắt buộc");
            }
              String slotTimeStr = request.get("slotTime").toString();
            final Long currentSpecialtyId;
            
            if (request.get("currentSpecialtyId") != null) {
                currentSpecialtyId = Long.valueOf(request.get("currentSpecialtyId").toString());
            } else {
                currentSpecialtyId = null;
            }
            
            // Parse slot time (format: "2024-01-15T10:00:00")
            LocalDateTime slotDateTime = LocalDateTime.parse(slotTimeStr);
            LocalDate slotDate = slotDateTime.toLocalDate();
            LocalTime slotTime = slotDateTime.toLocalTime();
            
            // Enhanced conflict detection with detailed information
            List<AvailabilitySlot> allSlotsAtTime = availabilitySlotService
                .getSlotsByDoctorAndDateRange(doctor.getDoctorId(), slotDate, slotDate)
                .stream()
                .filter(slot -> slot.getStartTime().equals(slotTime) && 
                               slot.getStatus() == AvailabilitySlot.SlotStatus.AVAILABLE)
                .toList();
              // Filter out slots from current specialty
            List<AvailabilitySlot> conflictingSlots = allSlotsAtTime.stream()
                .filter(slot -> {
                    // Filter by specialty if currentSpecialtyId is provided
                    if (currentSpecialtyId != null && slot.getSpecialty() != null) {
                        // Only consider as conflict if it's a different specialty
                        return !slot.getSpecialty().getSpecialtyId().equals(currentSpecialtyId);
                    }
                    // If no specialty filter, assume conflict if any available slot exists at same time
                    return true;
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasConflict", !conflictingSlots.isEmpty());
            response.put("conflictCount", conflictingSlots.size());
            response.put("slotTime", slotTimeStr);
            response.put("doctorId", doctor.getDoctorId());
            
            if (!conflictingSlots.isEmpty()) {
                List<Map<String, Object>> conflictDetails = new ArrayList<>();
                
                for (AvailabilitySlot conflictSlot : conflictingSlots) {
                    Map<String, Object> conflict = new HashMap<>();
                    conflict.put("slotId", conflictSlot.getSlotId());
                    conflict.put("clinicName", conflictSlot.getClinic().getName());
                    conflict.put("clinicId", conflictSlot.getClinic().getClinicId());
                    // TODO: Add specialty info when entity relationship is ready
                    conflict.put("specialtyName", "Chuyên khoa khác");
                    conflict.put("specialtyId", 0L); // Placeholder
                    conflict.put("timeSlot", String.format("%s - %s", 
                        conflictSlot.getStartTime(), conflictSlot.getEndTime()));
                    conflict.put("status", conflictSlot.getStatus().name());
                    
                    conflictDetails.add(conflict);
                }
                
                response.put("conflicts", conflictDetails);
                response.put("message", String.format(
                    "Có %d slot xung đột vào thời gian %s. Bạn có muốn tắt các slot này để bật slot mới?", 
                    conflictingSlots.size(), 
                    slotTime
                ));
                response.put("suggestedAction", "DISABLE_CONFLICTING_SLOTS");
            } else {
                response.put("message", "Không có xung đột. Có thể bật slot này.");
                response.put("suggestedAction", "ENABLE_SLOT");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking slot conflicts: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("hasConflict", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Lỗi khi kiểm tra xung đột: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    @Operation(summary = "Lấy slots theo chuyên khoa")
    @GetMapping("/my-availability/specialty/{specialtyId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getMyAvailabilitySlotsBySpecialty(
            Authentication auth,
            @PathVariable Long specialtyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            User currentUser = getCurrentUserFromAuth(auth);
            Doctor doctor = doctorService.getDoctorByUserId(currentUser.getUserId());
            
            if (startDate == null) startDate = LocalDate.now();
            if (endDate == null) endDate = startDate.plusDays(30);
            
            List<AvailabilitySlot> slots = availabilitySlotService
                .getSlotsByDoctorAndDateRange(doctor.getDoctorId(), startDate, endDate);
            
            // Filter by specialty if needed
            List<AvailabilitySlot> filteredSlots = slots.stream()
                .filter(slot -> slot.getSpecialty() != null && 
                               slot.getSpecialty().getSpecialtyId().equals(specialtyId))
                .collect(java.util.stream.Collectors.toList());
            
            List<AvailabilitySlotResponseDTO> responseDTOs = availabilitySlotMapper.toResponseDTOList(filteredSlots);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Error getting my availability slots by specialty: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Lấy lịch làm việc của bác sĩ theo ID")
    @GetMapping(value = "/doctor/{doctorId}", produces = "application/json") // Added produces attribute
    @PreAuthorize("isAuthenticated()") // Allow any authenticated user to view a doctor's schedule
    public ResponseEntity<Map<String, Object>> getDoctorScheduleById(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 50) Pageable pageable) {
        
        try {
            Doctor doctor = doctorService.getDoctorById(doctorId);
            
            if (startDate == null) startDate = LocalDate.now();
            if (endDate == null) endDate = startDate.plusDays(30); 
            
            List<AvailabilitySlot> slots = availabilitySlotService
                .getAvailableSlotsInDateRange(doctor.getDoctorId(), startDate, endDate);
            
            List<AvailabilitySlotResponseDTO> slotDTOs = availabilitySlotMapper.toResponseDTOList(slots);
            
            String specialtyName = "N/A";
            if (doctor.getSpecialties() != null && !doctor.getSpecialties().isEmpty()) {
                specialtyName = doctor.getSpecialties().stream()
                                .findFirst()
                                .map(ds -> ds.getSpecialty().getName())
                                .orElse("N/A");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("slots", slotDTOs);
            response.put("doctorId", doctor.getDoctorId());
            response.put("doctorName", doctor.getUser().getFullName());
            response.put("specialty", specialtyName);
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting schedule for doctor ID {}: ", doctorId, e);
            if (e instanceof jakarta.persistence.EntityNotFoundException || (e.getMessage() != null && e.getMessage().contains("No Doctor found with id"))) {
                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Doctor not found with ID: " + doctorId));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error retrieving doctor schedule"));
        }
    }
}
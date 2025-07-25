package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.repositories.AvailabilitySlotRepository;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.DoctorRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.services.AvailabilitySlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilitySlotServiceImpl implements AvailabilitySlotService {

    @Autowired
    private AvailabilitySlotRepository slotRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Override
    public AvailabilitySlot getSlotById(Long slotId) {
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ với ID: " + slotId));
    }

    @Override
    public List<AvailabilitySlot> getSlotsByDoctor(Long doctorId) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return slotRepository.findByDoctorDoctorId(doctorId);
    }

    @Override
    public Page<AvailabilitySlot> getSlotsByDoctor(Long doctorId, Pageable pageable) {
        return slotRepository.findByDoctorDoctorId(doctorId, pageable);
    }

    @Override
    public Page<AvailabilitySlot> getAvailableSlotsByDoctor(Long doctorId, Pageable pageable) {
        return slotRepository.findByDoctorDoctorIdAndStatus(doctorId, AvailabilitySlot.SlotStatus.AVAILABLE, pageable);
    }

    @Override
    public Page<AvailabilitySlot> getAllSlotsByDoctor(Long doctorId, Pageable pageable) {
        return slotRepository.findByDoctorDoctorId(doctorId, pageable);
    }

    @Override
    public List<AvailabilitySlot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return slotRepository.findByDoctorDoctorIdAndDate(doctorId, date);
    }

    @Override
    public List<AvailabilitySlot> getAvailableSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return slotRepository.findByDoctorDoctorIdAndDateAndStatus(doctorId, date, AvailabilitySlot.SlotStatus.AVAILABLE);
    }

    @Override
    public List<AvailabilitySlot> getSlotsByDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không thể sau ngày kết thúc");
        }
        
        return slotRepository.findByDoctorDoctorIdAndDateBetween(doctorId, startDate, endDate);
    }

    @Override
    public List<AvailabilitySlot> getAvailableSlotsInDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không thể sau ngày kết thúc");
        }
        
        return slotRepository.findByDoctorDoctorIdAndDateBetweenAndStatus(doctorId, startDate, endDate, AvailabilitySlot.SlotStatus.AVAILABLE);
    }

    @Override
    public List<AvailabilitySlot> getSlotsByDoctorAndDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không thể sau ngày kết thúc");
        }
        
        return slotRepository.findByDoctorDoctorIdAndDateBetween(doctorId, startDate, endDate);
    }

    @Override
    public List<AvailabilitySlot> findAvailableSlotsBySpecialtyAndDate(Long specialtyId, LocalDate date) {
        return slotRepository.findAvailableSlotsBySpecialtyAndDate(specialtyId, date);
    }

    @Override
    public List<AvailabilitySlot> getSlotsByClinic(Long clinicId) {
        // Kiểm tra phòng khám có tồn tại không
        if (!clinicRepository.existsById(clinicId)) {
            throw new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId);
        }
        
        return slotRepository.findByClinicClinicId(clinicId);
    }

    @Override
    @Transactional
    public AvailabilitySlot createSlot(AvailabilitySlotDTO slotDTO) {
        // Kiểm tra bác sĩ có tồn tại không
        Doctor doctor = doctorRepository.findById(slotDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + slotDTO.getDoctorId()));

        // Lấy thông tin phòng khám nếu có
        Clinic clinic = null;
        if (slotDTO.getClinicId() != null) {
            clinic = clinicRepository.findById(slotDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + slotDTO.getClinicId()));
        }
        
        // Lấy thông tin chuyên khoa nếu có
        Specialty specialty = null;
        if (slotDTO.getSpecialtyId() != null) {
            specialty = specialtyRepository.findById(slotDTO.getSpecialtyId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + slotDTO.getSpecialtyId()));
        }

        // Ghi đè tuyệt đối: Xóa TẤT CẢ slot cũ cùng doctor, date, startTime
        // Bao gồm cả slot ở chuyên khoa khác để tránh conflict
        List<AvailabilitySlot> conflictingSlots = slotRepository.findByDoctorDoctorIdAndDateAndStartTime(
            doctor.getDoctorId(), slotDTO.getDate(), slotDTO.getStartTime()
        );
        
        // Xóa tất cả slot trùng giờ, kể cả chuyên khoa khác
        for (AvailabilitySlot conflictSlot : conflictingSlots) {
            // Chỉ xóa nếu không phải slot đã đặt (BOOKED)
            if (conflictSlot.getStatus() != AvailabilitySlot.SlotStatus.BOOKED) {
                slotRepository.delete(conflictSlot);
            }
        }

        // Tạo slot mới
        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setDoctor(doctor);
        slot.setDate(slotDTO.getDate());
        slot.setStartTime(slotDTO.getStartTime());
        slot.setEndTime(slotDTO.getEndTime());
        // Nếu không truyền status thì mặc định là AVAILABLE
        AvailabilitySlot.SlotStatus status;
        if (slotDTO.getStatus() != null) {
            try {
                status = AvailabilitySlot.SlotStatus.valueOf(slotDTO.getStatus());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái không hợp lệ: " + slotDTO.getStatus());
            }
        } else {
            status = AvailabilitySlot.SlotStatus.AVAILABLE;
        }
        slot.setStatus(status);
        slot.setClinic(clinic);
        
        // Set specialty nếu có trong DTO
        if (specialty != null) {
            slot.setSpecialty(specialty);
        }
        
        return slotRepository.save(slot);
    }

    @Override
    @Transactional
    public List<AvailabilitySlot> createMultipleSlots(List<AvailabilitySlotDTO> slotDTOs) {
        List<AvailabilitySlot> createdSlots = new ArrayList<>();
        
        for (AvailabilitySlotDTO slotDTO : slotDTOs) {
            try {
                AvailabilitySlot slot = createSlot(slotDTO);
                createdSlots.add(slot);
            } catch (Exception e) {
                // Ghi log lỗi và tiếp tục
                System.err.println("Lỗi khi tạo slot: " + e.getMessage());
            }
        }
        
        return createdSlots;
    }

    @Override
    @Transactional
    public AvailabilitySlot updateSlot(Long slotId, AvailabilitySlotDTO slotDTO) {
        AvailabilitySlot slot = getSlotById(slotId);
        
        // Nếu cập nhật thông tin thời gian, kiểm tra trùng lặp
        if (slotDTO.getDate() != null || slotDTO.getStartTime() != null || slotDTO.getEndTime() != null) {
            LocalDate date = slotDTO.getDate() != null ? slotDTO.getDate() : slot.getDate();
            LocalTime startTime = slotDTO.getStartTime() != null ? slotDTO.getStartTime() : slot.getStartTime();
            LocalTime endTime = slotDTO.getEndTime() != null ? slotDTO.getEndTime() : slot.getEndTime();
            
            // Bỏ qua chính slot đang cập nhật khi kiểm tra trùng lặp
            List<AvailabilitySlot> overlappingSlots = slotRepository.findOverlappingSlots(
                    slot.getDoctor().getDoctorId(), date, startTime, endTime);
            
            boolean isOverlapping = overlappingSlots.stream()
                    .anyMatch(existingSlot -> !existingSlot.getSlotId().equals(slotId));
            
            if (isOverlapping) {
                throw new RuntimeException("Khung giờ này bị trùng lặp với khung giờ khác đã tồn tại");
            }
            
            // Cập nhật thông tin
            if (slotDTO.getDate() != null) slot.setDate(slotDTO.getDate());
            if (slotDTO.getStartTime() != null) slot.setStartTime(slotDTO.getStartTime());
            if (slotDTO.getEndTime() != null) slot.setEndTime(slotDTO.getEndTime());
        }
        
        // Cập nhật phòng khám nếu có thay đổi
        if (slotDTO.getClinicId() != null) {
            Clinic clinic = clinicRepository.findById(slotDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + slotDTO.getClinicId()));
            slot.setClinic(clinic);
        }
        
        // Cập nhật trạng thái nếu có
        if (slotDTO.getStatus() != null) {
            try {
                AvailabilitySlot.SlotStatus status = AvailabilitySlot.SlotStatus.valueOf(slotDTO.getStatus());
                slot.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Trạng thái không hợp lệ: " + slotDTO.getStatus());
            }
        }
        
        return slotRepository.save(slot);
    }

    @Override
    @Transactional
    public AvailabilitySlot updateSlotStatus(Long slotId, AvailabilitySlot.SlotStatus status) {
        AvailabilitySlot slot = getSlotById(slotId);
        slot.setStatus(status);
        return slotRepository.save(slot);
    }

    @Override
    public boolean isSlotOverlapping(Long doctorId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<AvailabilitySlot> overlappingSlots = slotRepository.findOverlappingSlots(doctorId, date, startTime, endTime);
        return !overlappingSlots.isEmpty();
    }

    @Override
    @Transactional
    public boolean deleteSlot(Long slotId) {
        if (slotRepository.existsById(slotId)) {
            slotRepository.deleteById(slotId);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public List<AvailabilitySlot> createBulkSlots(Long doctorId, Long clinicId, List<AvailabilitySlotDTO> slots) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
        Clinic clinic = null;
        if (clinicId != null) {
            clinic = clinicRepository.findById(clinicId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId));
        }
        List<AvailabilitySlot> createdSlots = new ArrayList<>();
        for (AvailabilitySlotDTO slotDTO : slots) {
            // Xóa slot cũ nếu trùng
            List<AvailabilitySlot> oldSlots = slotRepository.findByDoctorDoctorIdAndDateAndStartTimeAndEndTime(
                doctor.getDoctorId(), slotDTO.getDate(), slotDTO.getStartTime(), slotDTO.getEndTime()
            );
            for (AvailabilitySlot old : oldSlots) {
                if ((slotDTO.getSpecialtyId() == null || (old.getSpecialty() != null && old.getSpecialty().getSpecialtyId().equals(slotDTO.getSpecialtyId()))) &&
                    (clinic == null || (old.getClinic() != null && old.getClinic().getClinicId().equals(clinic.getClinicId())))) {
                    slotRepository.delete(old);
                }
            }
            // Tạo slot mới
            AvailabilitySlot slot = new AvailabilitySlot();
            slot.setDoctor(doctor);
            slot.setDate(slotDTO.getDate());
            slot.setStartTime(slotDTO.getStartTime());
            slot.setEndTime(slotDTO.getEndTime());
            slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE); // Luôn AVAILABLE
            slot.setClinic(clinic);
            createdSlots.add(slotRepository.save(slot));
        }
        return createdSlots;
    }

    @Override
    public void deleteAutoGeneratedSlotsByDoctorSpecialtyAndDateRange(Long doctorId, Long specialtyId, LocalDate startDate, LocalDate endDate) {
        List<AvailabilitySlot> slots = slotRepository.findScheduleByDoctorSpecialtyAndDateRange(doctorId, specialtyId, startDate, endDate);
        slots.removeIf(slot -> slot.getAutoGenerated() == null || !slot.getAutoGenerated());
        slotRepository.deleteAll(slots);
    }

    // Scheduled job: Xóa slot hết hạn (endTime < now) và không phải là slot đã được đặt.
    // Chạy mỗi 10 phút.
    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void deleteExpiredSlotsScheduled() {
        // Chỉ xóa các slot đã qua, có trạng thái cho phép xóa, và CHƯA TỪNG được đặt
        // để bảo toàn tính toàn vẹn của khóa ngoại trong bảng appointments.
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        List<AvailabilitySlot.SlotStatus> deletableStatuses = List.of(
                AvailabilitySlot.SlotStatus.AVAILABLE,
                AvailabilitySlot.SlotStatus.CANCELLED_BY_CLINIC,
                AvailabilitySlot.SlotStatus.ON_LEAVE
        );
        List<AvailabilitySlot> expiredSlots = slotRepository.findTrulyExpiredAndUnusedSlots(currentDate, currentTime, deletableStatuses);
        if (!expiredSlots.isEmpty()) {
            slotRepository.deleteAll(expiredSlots);
        }
    }

    @Override
    @Transactional
    public AvailabilitySlot saveSlot(AvailabilitySlot slot) {
        return slotRepository.save(slot);
    }

    @Override
    public List<AvailabilitySlot> batchUpdateSlotStatuses(List<Long> slotIds, AvailabilitySlot.SlotStatus newStatus) {
        List<AvailabilitySlot> slots = slotRepository.findAllById(slotIds);
        for (AvailabilitySlot slot : slots) {
            slot.setStatus(newStatus);
        }
        return slotRepository.saveAll(slots);
    }

    @Override
    public Long countAvailableSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        return (long) slotRepository.findByDoctorDoctorIdAndDateAndStatus(doctorId, date, AvailabilitySlot.SlotStatus.AVAILABLE).size();
    }

    @Override
    public List<AvailabilitySlot> findConflictingSlots(Long doctorId, LocalDate date, LocalTime startTime, Long excludeSpecialtyId) {
        return slotRepository.findConflictingSlots(doctorId, date, startTime, excludeSpecialtyId);
    }

    @Override
    public List<AvailabilitySlot> findByDoctorAndDateAndShift(Long doctorId, LocalDate date, Long shiftId) {
        return slotRepository.findByDoctorAndDateAndShift(doctorId, date, shiftId);
    }

    @Override
    @Transactional
    public AvailabilitySlot createSlotDirect(Doctor doctor, LocalDate date, LocalTime startTime, LocalTime endTime, AvailabilitySlot.SlotStatus status, Clinic clinic, Long specialtyId, Integer slotDurationMinutes, Boolean autoGenerated, Long createdFromShiftId, String notes) {
        // Ghi đè tuyệt đối: Xóa TẤT CẢ slot cũ cùng doctor, date, startTime
        // Bao gồm cả slot ở chuyên khoa khác để tránh conflict
        List<AvailabilitySlot> conflictingSlots = slotRepository.findByDoctorDoctorIdAndDateAndStartTime(
            doctor.getDoctorId(), date, startTime
        );
        
        // Xóa tất cả slot trùng giờ, kể cả chuyên khoa khác
        for (AvailabilitySlot conflictSlot : conflictingSlots) {
            // Chỉ xóa nếu không phải slot đã đặt (BOOKED) - ghi đè tuyệt đối cho các slot khác
            if (conflictSlot.getStatus() != AvailabilitySlot.SlotStatus.BOOKED) {
                slotRepository.delete(conflictSlot);
            }
        }
        
        // Tạo slot mới
        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setDoctor(doctor);
        slot.setDate(date);
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        slot.setStatus(status);
        slot.setClinic(clinic);
        slot.setSlotDurationMinutes(slotDurationMinutes);
        slot.setAutoGenerated(autoGenerated);
        slot.setCreatedFromShiftId(createdFromShiftId);
        slot.setNotes(notes);
        
        // Gán specialty nếu có - PHẢI CÓ để hiển thị trong UI
        if (specialtyId != null) {
            Specialty specialty = specialtyRepository.findById(specialtyId).orElse(null);
            if (specialty != null) {
                slot.setSpecialty(specialty);
                System.out.println("DEBUG: Set specialty for slot: specialtyId=" + specialtyId + ", specialtyName=" + specialty.getName());
            } else {
                System.out.println("ERROR: Specialty not found with ID: " + specialtyId);
            }
        } else {
            System.out.println("WARNING: No specialtyId provided for createSlotDirect");
        }
        
        AvailabilitySlot savedSlot = slotRepository.save(slot);
        System.out.println("DEBUG: Slot saved successfully: slotId=" + savedSlot.getSlotId() + 
            ", specialtyId=" + (savedSlot.getSpecialty() != null ? savedSlot.getSpecialty().getSpecialtyId() : "NULL") +
            ", notes=" + savedSlot.getNotes() + 
            ", autoGenerated=" + savedSlot.getAutoGenerated() +
            ", createdFromShiftId=" + savedSlot.getCreatedFromShiftId());
        
        return savedSlot;
    }

    @Override
    public List<AvailabilitySlot> searchSlots(Long doctorId, Long clinicId, LocalDate date, AvailabilitySlot.SlotStatus status) {
        // Lọc theo từng trường nếu có, nếu null thì bỏ qua
        List<AvailabilitySlot> slots = slotRepository.findAll();
        if (doctorId != null) {
            slots.removeIf(slot -> !slot.getDoctor().getDoctorId().equals(doctorId));
        }
        if (clinicId != null) {
            slots.removeIf(slot -> slot.getClinic() == null || !slot.getClinic().getClinicId().equals(clinicId));
        }
        if (date != null) {
            slots.removeIf(slot -> !slot.getDate().equals(date));
        }
        if (status != null) {
            slots.removeIf(slot -> slot.getStatus() == null || !slot.getStatus().equals(status));
        }
        return slots;
    }
}
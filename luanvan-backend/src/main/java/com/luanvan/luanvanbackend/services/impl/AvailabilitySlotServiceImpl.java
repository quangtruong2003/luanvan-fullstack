package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.AvailabilitySlotDTO;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.repositories.AvailabilitySlotRepository;
import com.luanvan.luanvanbackend.repositories.ClinicRepository;
import com.luanvan.luanvanbackend.repositories.DoctorRepository;
import com.luanvan.luanvanbackend.services.AvailabilitySlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        // Để thực hiện phân trang, cần tạo phương thức mới trong repository
        throw new UnsupportedOperationException("Chức năng này chưa được triển khai");
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
        
        // Kiểm tra trùng lặp
        if (isSlotOverlapping(slotDTO.getDoctorId(), slotDTO.getDate(), slotDTO.getStartTime(), slotDTO.getEndTime())) {
            throw new RuntimeException("Khung giờ này bị trùng lặp với khung giờ khác đã tồn tại");
        }
        
        // Lấy thông tin phòng khám nếu có
        Clinic clinic = null;
        if (slotDTO.getClinicId() != null) {
            clinic = clinicRepository.findById(slotDTO.getClinicId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + slotDTO.getClinicId()));
        }
        
        // Tạo slot mới
        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setDoctor(doctor);
        slot.setDate(slotDTO.getDate());
        slot.setStartTime(slotDTO.getStartTime());
        slot.setEndTime(slotDTO.getEndTime());
        
        // Xử lý trạng thái
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
        // Kiểm tra bác sĩ có tồn tại không
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
        
        // Lấy thông tin phòng khám nếu có
        Clinic clinic = null;
        if (clinicId != null) {
            clinic = clinicRepository.findById(clinicId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng khám với ID: " + clinicId));
        }
        
        List<AvailabilitySlot> createdSlots = new ArrayList<>();
        
        for (AvailabilitySlotDTO slotDTO : slots) {
            // Kiểm tra trùng lặp
            if (isSlotOverlapping(doctorId, slotDTO.getDate(), slotDTO.getStartTime(), slotDTO.getEndTime())) {
                // Ghi log và bỏ qua slot bị trùng
                System.err.println("Khung giờ bị trùng lặp: " + slotDTO.getDate() + " " 
                        + slotDTO.getStartTime() + "-" + slotDTO.getEndTime());
                continue;
            }
            
            // Tạo slot mới
            AvailabilitySlot slot = new AvailabilitySlot();
            slot.setDoctor(doctor);
            slot.setDate(slotDTO.getDate());
            slot.setStartTime(slotDTO.getStartTime());
            slot.setEndTime(slotDTO.getEndTime());
            slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
            slot.setClinic(clinic);
            
            createdSlots.add(slotRepository.save(slot));
        }
        
        return createdSlots;
    }

    @Override
    public List<AvailabilitySlot> searchSlots(Long doctorId, Long clinicId, LocalDate date, AvailabilitySlot.SlotStatus status) {
        List<AvailabilitySlot> slots;
        
        // Nếu có doctorId và date, sử dụng query tối ưu nhất
        if (doctorId != null && date != null) {
            slots = slotRepository.findByDoctorDoctorIdAndDate(doctorId, date);
        } 
        // Nếu chỉ có doctorId
        else if (doctorId != null) {
            slots = slotRepository.findByDoctorDoctorId(doctorId);
        }
        // Nếu chỉ có clinicId
        else if (clinicId != null) {
            slots = slotRepository.findByClinicClinicId(clinicId);
        }
        // Nếu chỉ có date và status
        else if (date != null && status != null) {
            slots = slotRepository.findByDateAndStatus(date, status);
        }
        // Nếu chỉ có date
        else if (date != null) {
            slots = slotRepository.findAll().stream()
                    .filter(slot -> slot.getDate().equals(date))
                    .toList();
        }
        // Nếu không có filter gì, lấy tất cả (cẩn thận với performance)
        else {
            slots = slotRepository.findAll();
        }
        
        // Lọc thêm theo clinicId nếu cần
        if (clinicId != null && doctorId != null) {
            slots = slots.stream()
                    .filter(slot -> slot.getClinic() != null && slot.getClinic().getClinicId().equals(clinicId))
                    .toList();
        }
        
        // Lọc thêm theo status nếu cần
        if (status != null && (date == null || clinicId != null || doctorId != null)) {
            slots = slots.stream()
                    .filter(slot -> slot.getStatus() == status)
                    .toList();
        }
        
        return slots;
    }

    @Override
    public Page<AvailabilitySlot> getAvailableSlotsByDoctor(Long doctorId, Pageable pageable) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return slotRepository.findByDoctorDoctorIdAndStatus(doctorId, AvailabilitySlot.SlotStatus.AVAILABLE, pageable);
    }

    @Override
    public Page<AvailabilitySlot> getAllSlotsByDoctor(Long doctorId, Pageable pageable) {
        // Kiểm tra bác sĩ có tồn tại không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return slotRepository.findByDoctorDoctorId(doctorId, pageable);
    }
} 
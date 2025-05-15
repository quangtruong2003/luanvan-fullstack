package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.DoctorAvailabilityRequestDTO;
import com.luanvan.luanvanbackend.dto.RequestStatusUpdateDTO;
import com.luanvan.luanvanbackend.dto.RequestedSlotDTO;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.entities.DoctorAvailabilityRequest;
import com.luanvan.luanvanbackend.entities.RequestedSlot;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.DoctorAvailabilityRequestRepository;
import com.luanvan.luanvanbackend.repositories.DoctorRepository;
import com.luanvan.luanvanbackend.repositories.RequestedSlotRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.DoctorAvailabilityRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class DoctorAvailabilityRequestServiceImpl implements DoctorAvailabilityRequestService {

    @Autowired
    private DoctorAvailabilityRequestRepository requestRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RequestedSlotRepository slotRepository;

    @Override
    public DoctorAvailabilityRequest getRequestById(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu với ID: " + requestId));
    }

    @Override
    public List<DoctorAvailabilityRequest> getRequestsByDoctor(Long doctorId) {
        // Kiểm tra bác sĩ có tồn tại hay không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return requestRepository.findByDoctorDoctorId(doctorId);
    }

    @Override
    public Page<DoctorAvailabilityRequest> getRequestsByDoctor(Long doctorId, Pageable pageable) {
        // Kiểm tra bác sĩ có tồn tại hay không
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId);
        }
        
        return requestRepository.findByDoctorDoctorId(doctorId, pageable);
    }

    @Override
    public List<DoctorAvailabilityRequest> getRequestsByStatus(String status) {
        try {
            DoctorAvailabilityRequest.RequestStatus requestStatus = 
                    DoctorAvailabilityRequest.RequestStatus.valueOf(status.toUpperCase());
            return requestRepository.findByStatus(requestStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    @Override
    public Page<DoctorAvailabilityRequest> getRequestsByStatus(String status, Pageable pageable) {
        // Cần bổ sung phương thức findByStatus trong repository để hỗ trợ phân trang
        // Hiện tại chỉ có phương thức không phân trang
        try {
            DoctorAvailabilityRequest.RequestStatus requestStatus = 
                    DoctorAvailabilityRequest.RequestStatus.valueOf(status.toUpperCase());
            // Giả sử đã có phương thức này
            // return requestRepository.findByStatus(requestStatus, pageable);
            
            // Giải pháp tạm thời
            return null; // TODO: Bổ sung phương thức trong repository
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }
    }

    @Override
    public List<DoctorAvailabilityRequest> getRequestsByReviewer(Long reviewerId) {
        // Kiểm tra người xét duyệt có tồn tại hay không
        if (!userRepository.existsById(reviewerId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + reviewerId);
        }
        
        return requestRepository.findByReviewerUserId(reviewerId);
    }

    @Override
    public Page<DoctorAvailabilityRequest> getRequestsByReviewer(Long reviewerId, Pageable pageable) {
        // Cần bổ sung phương thức findByReviewerUserId trong repository để hỗ trợ phân trang
        // Hiện tại chỉ có phương thức không phân trang
        
        // Kiểm tra người xét duyệt có tồn tại hay không
        if (!userRepository.existsById(reviewerId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + reviewerId);
        }
        
        // Giả sử đã có phương thức này
        // return requestRepository.findByReviewerUserId(reviewerId, pageable);
        
        // Giải pháp tạm thời
        return null; // TODO: Bổ sung phương thức trong repository
    }

    @Override
    public List<DoctorAvailabilityRequest> getRequestsByWeek(LocalDate weekStartDate) {
        // Khoảng thời gian 1 tuần
        LocalDate weekEndDate = weekStartDate.plusDays(7);
        
        return requestRepository.findByWeekStartDateBetween(weekStartDate, weekEndDate);
    }

    @Override
    @Transactional
    public DoctorAvailabilityRequest createRequest(Long doctorId, DoctorAvailabilityRequestDTO requestDTO) {
        // Kiểm tra bác sĩ có tồn tại hay không
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
        
        // Tạo yêu cầu mới
        DoctorAvailabilityRequest request = new DoctorAvailabilityRequest();
        request.setDoctor(doctor);
        request.setWeekStartDate(requestDTO.getWeekStartDate());
        request.setSubmissionTimestamp(LocalDateTime.now());
        request.setStatus(DoctorAvailabilityRequest.RequestStatus.PENDING);
        
        // Lưu yêu cầu để có ID
        DoctorAvailabilityRequest savedRequest = requestRepository.save(request);
        
        // Tạo các slot được yêu cầu
        Set<RequestedSlot> slots = new HashSet<>();
        for (RequestedSlotDTO slotDTO : requestDTO.getRequestedSlots()) {
            RequestedSlot slot = new RequestedSlot();
            slot.setRequest(savedRequest);
            slot.setDate(slotDTO.getDate());
            slot.setStartTime(slotDTO.getStartTime());
            slot.setEndTime(slotDTO.getEndTime());
            slots.add(slotRepository.save(slot));
        }
        
        savedRequest.setRequestedSlots(slots);
        return savedRequest;
    }

    @Override
    @Transactional
    public DoctorAvailabilityRequest updateRequestStatus(Long requestId, Long reviewerId, RequestStatusUpdateDTO statusUpdateDTO) {
        // Kiểm tra yêu cầu có tồn tại hay không
        DoctorAvailabilityRequest request = getRequestById(requestId);
        
        // Kiểm tra người xét duyệt có tồn tại hay không
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + reviewerId));
        
        // Kiểm tra trạng thái mới có hợp lệ hay không
        try {
            DoctorAvailabilityRequest.RequestStatus newStatus = 
                    DoctorAvailabilityRequest.RequestStatus.valueOf(statusUpdateDTO.getStatus().toUpperCase());
            
            request.setStatus(newStatus);
            request.setReviewer(reviewer);
            request.setReviewTimestamp(LocalDateTime.now());
            request.setReviewNotes(statusUpdateDTO.getReviewNotes());
            
            return requestRepository.save(request);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + statusUpdateDTO.getStatus());
        }
    }

    @Override
    @Transactional
    public boolean deleteRequest(Long requestId) {
        DoctorAvailabilityRequest request = getRequestById(requestId);
        
        // Chỉ cho phép xóa yêu cầu nếu nó đang ở trạng thái PENDING hoặc NEEDS_REVISION
        if (request.getStatus() == DoctorAvailabilityRequest.RequestStatus.PENDING || 
                request.getStatus() == DoctorAvailabilityRequest.RequestStatus.NEEDS_REVISION) {
            requestRepository.delete(request);
            return true;
        } else {
            throw new RuntimeException("Không thể xóa yêu cầu vì nó đã được xét duyệt");
        }
    }
} 
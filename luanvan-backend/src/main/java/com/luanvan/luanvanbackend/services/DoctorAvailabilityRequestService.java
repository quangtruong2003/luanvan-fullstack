package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.DoctorAvailabilityRequestDTO;
import com.luanvan.luanvanbackend.dto.RequestStatusUpdateDTO;
import com.luanvan.luanvanbackend.entities.DoctorAvailabilityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface DoctorAvailabilityRequestService {
    
    /**
     * Lấy thông tin yêu cầu theo ID
     * @param requestId ID của yêu cầu
     * @return Thông tin yêu cầu
     */
    DoctorAvailabilityRequest getRequestById(Long requestId);
    
    /**
     * Lấy danh sách yêu cầu theo bác sĩ
     * @param doctorId ID của bác sĩ
     * @return Danh sách yêu cầu
     */
    List<DoctorAvailabilityRequest> getRequestsByDoctor(Long doctorId);
    
    /**
     * Lấy danh sách yêu cầu theo bác sĩ có phân trang
     * @param doctorId ID của bác sĩ
     * @param pageable Thông tin phân trang
     * @return Danh sách yêu cầu có phân trang
     */
    Page<DoctorAvailabilityRequest> getRequestsByDoctor(Long doctorId, Pageable pageable);
    
    /**
     * Lấy danh sách yêu cầu theo trạng thái
     * @param status Trạng thái yêu cầu
     * @return Danh sách yêu cầu
     */
    List<DoctorAvailabilityRequest> getRequestsByStatus(String status);
    
    /**
     * Lấy danh sách yêu cầu theo trạng thái có phân trang
     * @param status Trạng thái yêu cầu
     * @param pageable Thông tin phân trang
     * @return Danh sách yêu cầu có phân trang
     */
    Page<DoctorAvailabilityRequest> getRequestsByStatus(String status, Pageable pageable);
    
    /**
     * Lấy danh sách yêu cầu theo người xét duyệt
     * @param reviewerId ID của người xét duyệt
     * @return Danh sách yêu cầu
     */
    List<DoctorAvailabilityRequest> getRequestsByReviewer(Long reviewerId);
    
    /**
     * Lấy danh sách yêu cầu theo người xét duyệt có phân trang
     * @param reviewerId ID của người xét duyệt
     * @param pageable Thông tin phân trang
     * @return Danh sách yêu cầu có phân trang
     */
    Page<DoctorAvailabilityRequest> getRequestsByReviewer(Long reviewerId, Pageable pageable);
    
    /**
     * Lấy danh sách yêu cầu theo tuần làm việc
     * @param weekStartDate Ngày đầu tuần
     * @return Danh sách yêu cầu
     */
    List<DoctorAvailabilityRequest> getRequestsByWeek(LocalDate weekStartDate);
    
    /**
     * Tạo yêu cầu mới
     * @param doctorId ID của bác sĩ
     * @param requestDTO Thông tin yêu cầu
     * @return Yêu cầu đã được tạo
     */
    DoctorAvailabilityRequest createRequest(Long doctorId, DoctorAvailabilityRequestDTO requestDTO);
    
    /**
     * Cập nhật trạng thái yêu cầu
     * @param requestId ID của yêu cầu
     * @param reviewerId ID của người xét duyệt
     * @param statusUpdateDTO Thông tin cập nhật trạng thái
     * @return Yêu cầu đã được cập nhật
     */
    DoctorAvailabilityRequest updateRequestStatus(Long requestId, Long reviewerId, RequestStatusUpdateDTO statusUpdateDTO);
    
    /**
     * Xóa yêu cầu
     * @param requestId ID của yêu cầu
     * @return true nếu xóa thành công
     */
    boolean deleteRequest(Long requestId);
} 
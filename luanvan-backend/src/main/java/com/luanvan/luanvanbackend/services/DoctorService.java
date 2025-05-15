package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorService {
    
    /**
     * Lấy thông tin bác sĩ theo ID
     * @param doctorId ID của bác sĩ
     * @return Thông tin bác sĩ
     */
    Doctor getDoctorById(Long doctorId);
    
    /**
     * Lấy thông tin bác sĩ theo ID người dùng
     * @param userId ID của người dùng
     * @return Thông tin bác sĩ
     */
    Doctor getDoctorByUserId(Long userId);
    
    /**
     * Lấy tất cả bác sĩ trong hệ thống
     * @return Danh sách bác sĩ
     */
    List<Doctor> getAllDoctors();
    
    /**
     * Lấy danh sách bác sĩ có phân trang
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ có phân trang
     */
    Page<Doctor> getAllDoctors(Pageable pageable);
    
    /**
     * Lấy danh sách bác sĩ theo chuyên khoa
     * @param specialtyId ID của chuyên khoa
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ thuộc chuyên khoa
     */
    Page<Doctor> getDoctorsBySpecialty(Long specialtyId, Pageable pageable);
    
    /**
     * Tìm kiếm bác sĩ theo tên
     * @param name Tên bác sĩ cần tìm
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ phù hợp
     */
    Page<Doctor> searchDoctorsByName(String name, Pageable pageable);
    
    /**
     * Lấy danh sách bác sĩ theo số năm kinh nghiệm
     * @param yearsOfExperience Số năm kinh nghiệm tối thiểu
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ có kinh nghiệm phù hợp
     */
    Page<Doctor> getDoctorsByExperience(int yearsOfExperience, Pageable pageable);
    
    /**
     * Tạo hồ sơ bác sĩ mới
     * @param userId ID của người dùng
     * @param doctorDTO Thông tin bác sĩ
     * @return Hồ sơ bác sĩ đã được tạo
     */
    Doctor createDoctor(Long userId, DoctorDTO doctorDTO);
    
    /**
     * Cập nhật thông tin bác sĩ
     * @param doctorId ID của bác sĩ
     * @param doctorUpdateDTO Thông tin cập nhật
     * @return Thông tin bác sĩ sau khi cập nhật
     */
    Doctor updateDoctor(Long doctorId, DoctorUpdateDTO doctorUpdateDTO);
    
    /**
     * Cập nhật ảnh đại diện của bác sĩ
     * @param doctorId ID của bác sĩ
     * @param profilePictureURL URL ảnh đại diện
     * @return Thông tin bác sĩ sau khi cập nhật
     */
    Doctor updateProfilePicture(Long doctorId, String profilePictureURL);
    
    /**
     * Gán chuyên khoa cho bác sĩ
     * @param doctorId ID của bác sĩ
     * @param specialtyId ID của chuyên khoa
     * @param isPrimary Đánh dấu là chuyên khoa chính
     * @return true nếu gán thành công
     */
    boolean assignSpecialty(Long doctorId, Long specialtyId, boolean isPrimary);
    
    /**
     * Xóa chuyên khoa khỏi bác sĩ
     * @param doctorId ID của bác sĩ
     * @param specialtyId ID của chuyên khoa
     * @return true nếu xóa thành công
     */
    boolean removeSpecialty(Long doctorId, Long specialtyId);
    
    /**
     * Lấy danh sách chuyên khoa của bác sĩ
     * @param doctorId ID của bác sĩ
     * @return Danh sách chuyên khoa
     */
    List<Object> getDoctorSpecialties(Long doctorId);
} 
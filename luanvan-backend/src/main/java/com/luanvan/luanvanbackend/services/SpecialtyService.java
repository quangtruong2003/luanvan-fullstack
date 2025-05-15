package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.SpecialtyDTO;
import com.luanvan.luanvanbackend.entities.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SpecialtyService {
    
    /**
     * Lấy thông tin chuyên khoa theo ID
     * @param specialtyId ID của chuyên khoa
     * @return Thông tin chuyên khoa
     */
    Specialty getSpecialtyById(Long specialtyId);
    
    /**
     * Lấy tất cả chuyên khoa
     * @return Danh sách chuyên khoa
     */
    List<Specialty> getAllSpecialties();
    
    /**
     * Lấy danh sách chuyên khoa có phân trang
     * @param pageable Thông tin phân trang
     * @return Danh sách chuyên khoa có phân trang
     */
    Page<Specialty> getAllSpecialties(Pageable pageable);
    
    /**
     * Lấy danh sách chuyên khoa theo phòng khám
     * @param clinicId ID của phòng khám
     * @return Danh sách chuyên khoa thuộc phòng khám
     */
    List<Specialty> getSpecialtiesByClinic(Long clinicId);
    
    /**
     * Tìm kiếm chuyên khoa theo tên
     * @param name Tên chuyên khoa cần tìm
     * @param pageable Thông tin phân trang
     * @return Danh sách chuyên khoa phù hợp
     */
    Page<Specialty> searchSpecialtiesByName(String name, Pageable pageable);
    
    /**
     * Tạo chuyên khoa mới
     * @param specialtyDTO Thông tin chuyên khoa
     * @return Chuyên khoa đã được tạo
     */
    Specialty createSpecialty(SpecialtyDTO specialtyDTO);
    
    /**
     * Cập nhật thông tin chuyên khoa
     * @param specialtyId ID của chuyên khoa
     * @param specialtyDTO Thông tin cập nhật
     * @return Thông tin chuyên khoa sau khi cập nhật
     */
    Specialty updateSpecialty(Long specialtyId, SpecialtyDTO specialtyDTO);
    
    /**
     * Xóa chuyên khoa
     * @param specialtyId ID của chuyên khoa
     * @return true nếu xóa thành công
     */
    boolean deleteSpecialty(Long specialtyId);
} 
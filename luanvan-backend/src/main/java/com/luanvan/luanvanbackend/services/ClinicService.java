package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.ClinicDTO;
import com.luanvan.luanvanbackend.dto.ClinicUpdateDTO;
import com.luanvan.luanvanbackend.dto.ClinicResponseDTO;
import com.luanvan.luanvanbackend.entities.Clinic;
import com.luanvan.luanvanbackend.entities.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClinicService {
    
    /**
     * Lấy thông tin phòng khám theo ID
     * @param clinicId ID của phòng khám
     * @return Thông tin phòng khám
     */
    Clinic getClinicById(Long clinicId);
    
    /**
     * Lấy thông tin phòng khám theo ID dưới dạng DTO
     * @param clinicId ID của phòng khám
     * @return Thông tin phòng khám DTO
     */
    ClinicResponseDTO getClinicResponseDTOById(Long clinicId);
    
    /**
     * Lấy tất cả phòng khám
     * @return Danh sách phòng khám
     */
    List<Clinic> getAllClinics();
    
    /**
     * Lấy danh sách phòng khám có phân trang dưới dạng DTO
     * @param pageable Thông tin phân trang
     * @return Danh sách phòng khám có phân trang
     */
    Page<ClinicResponseDTO> getAllClinicsDTO(Pageable pageable);
    
    /**
     * Lấy danh sách phòng khám có phân trang
     * @param pageable Thông tin phân trang
     * @return Danh sách phòng khám có phân trang
     */
    Page<Clinic> getAllClinics(Pageable pageable);
    
    /**
     * Tìm kiếm phòng khám theo tên
     * @param name Tên phòng khám cần tìm
     * @param pageable Thông tin phân trang
     * @return Danh sách phòng khám phù hợp
     */
    Page<Clinic> searchClinicsByName(String name, Pageable pageable);
    
    /**
     * Tìm kiếm phòng khám theo tên dưới dạng DTO
     * @param name Tên phòng khám cần tìm
     * @param pageable Thông tin phân trang
     * @return Danh sách phòng khám DTO phù hợp
     */
    Page<ClinicResponseDTO> searchClinicsByNameDTO(String name, Pageable pageable);
    
    /**
     * Tạo phòng khám mới
     * @param clinicDTO Thông tin phòng khám
     * @return Phòng khám đã được tạo
     */
    Clinic createClinic(ClinicDTO clinicDTO);
    
    /**
     * Cập nhật thông tin phòng khám
     * @param clinicId ID của phòng khám
     * @param clinicUpdateDTO Thông tin cập nhật
     * @return Thông tin phòng khám sau khi cập nhật
     */
    Clinic updateClinic(Long clinicId, ClinicUpdateDTO clinicUpdateDTO);
    
    /**
     * Cập nhật logo phòng khám
     * @param clinicId ID của phòng khám
     * @param logoURL URL logo mới
     * @return Thông tin phòng khám sau khi cập nhật
     */
    Clinic updateLogo(Long clinicId, String logoURL);
    
    /**
     * Xóa phòng khám
     * @param clinicId ID của phòng khám
     * @return true nếu xóa thành công
     */
    boolean deleteClinic(Long clinicId);
    
    /**
     * Lấy danh sách chuyên khoa của phòng khám
     * @param clinicId ID của phòng khám
     * @return Danh sách chuyên khoa
     */
    List<Specialty> getSpecialtiesByClinic(Long clinicId);
} 
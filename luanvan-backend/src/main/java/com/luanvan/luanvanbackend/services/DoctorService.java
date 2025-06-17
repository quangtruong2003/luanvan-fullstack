package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorResponseDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.entities.User;
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
     * Lấy thông tin bác sĩ theo ID dạng DTO
     * @param doctorId ID của bác sĩ
     * @return Thông tin bác sĩ dạng DTO
     */
    DoctorResponseDTO getDoctorResponseDTOById(Long doctorId);
    
    /**
     * Lấy thông tin bác sĩ theo ID người dùng
     * @param userId ID của người dùng
     * @return Thông tin bác sĩ
     */
    Doctor getDoctorByUserId(Long userId);
    
    /**
     * Lấy thông tin bác sĩ theo ID người dùng dạng DTO
     * @param userId ID của người dùng
     * @return Thông tin bác sĩ dạng DTO
     */
    DoctorResponseDTO getDoctorResponseDTOByUserId(Long userId);
    
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
     * Lấy danh sách bác sĩ theo chuyên khoa dạng DTO
     * @param specialtyId ID của chuyên khoa
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ DTO thuộc chuyên khoa
     */
    Page<DoctorResponseDTO> getDoctorsBySpecialtyDTO(Long specialtyId, Pageable pageable);
    
    /**
     * Tìm kiếm bác sĩ theo tên dạng DTO
     * @param name Tên bác sĩ cần tìm
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ DTO phù hợp
     */
    Page<DoctorResponseDTO> searchDoctorsByNameDTO(String name, Pageable pageable);
    
    /**
     * Lấy danh sách bác sĩ theo số năm kinh nghiệm
     * @param yearsOfExperience Số năm kinh nghiệm tối thiểu
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ có kinh nghiệm phù hợp
     */
    Page<Doctor> getDoctorsByExperience(int yearsOfExperience, Pageable pageable);
    
    /**
     * Tạo hồ sơ bác sĩ mới
     * @param user User entity
     * @param doctorDTO Thông tin bác sĩ
     * @return Hồ sơ bác sĩ đã được tạo
     */
    Doctor createDoctor(User user, DoctorDTO doctorDTO);
    
    /**
     * Tạo hồ sơ bác sĩ mới và trả về DTO
     * @param user Thông tin người dùng
     * @param doctorDTO Dữ liệu hồ sơ bác sĩ
     * @return Hồ sơ bác sĩ đã được tạo dạng DTO
     */
    DoctorResponseDTO createDoctorReturnDTO(User user, DoctorDTO doctorDTO);
    
    /**
     * Cập nhật thông tin bác sĩ
     * @param doctorId ID của bác sĩ
     * @param doctorUpdateDTO Dữ liệu cập nhật
     * @return Thông tin bác sĩ sau khi cập nhật
     */
    Doctor updateDoctor(Long doctorId, DoctorUpdateDTO doctorUpdateDTO);
    
    /**
     * Cập nhật thông tin bác sĩ và trả về DTO
     * @param doctorId ID của bác sĩ
     * @param doctorUpdateDTO Dữ liệu cập nhật
     * @return Thông tin bác sĩ sau khi cập nhật dạng DTO
     */
    DoctorResponseDTO updateDoctorReturnDTO(Long doctorId, DoctorUpdateDTO doctorUpdateDTO);
    
    /**
     * Xóa bác sĩ
     * @param doctorId ID của bác sĩ cần xóa
     * @return true nếu xóa thành công, false nếu thất bại
     */
    void deleteDoctor(Long doctorId);
    
    /**
     * Gán chuyên khoa cho bác sĩ
     * @param doctorId ID của bác sĩ
     * @param specialtyId ID của chuyên khoa
     * @param isPrimary Có phải chuyên khoa chính hay không
     * @return true nếu gán thành công, false nếu thất bại
     */
    void assignSpecialty(Long doctorId, Long specialtyId, boolean isPrimary);
    
    /**
     * Xóa chuyên khoa khỏi bác sĩ
     * @param doctorId ID của bác sĩ
     * @param specialtyId ID của chuyên khoa
     * @return true nếu xóa thành công
     */
    void removeSpecialty(Long doctorId, Long specialtyId);
    
    /**
     * Lấy danh sách chuyên khoa của bác sĩ
     * @param doctorId ID của bác sĩ
     * @return Danh sách chuyên khoa
     */
    List<Object> getDoctorSpecialties(Long doctorId);
    
    /**
     * Lấy danh sách tất cả bác sĩ dạng DTO (tránh circular reference)
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ DTO có phân trang
     */
    Page<DoctorResponseDTO> getAllDoctorsDTO(Pageable pageable);
    
    /**
     * Lấy danh sách bác sĩ theo số năm kinh nghiệm dạng DTO
     * @param yearsOfExperience Số năm kinh nghiệm tối thiểu
     * @param pageable Thông tin phân trang
     * @return Danh sách bác sĩ DTO có phân trang
     */
    Page<DoctorResponseDTO> getDoctorsByExperienceDTO(int yearsOfExperience, Pageable pageable);
}
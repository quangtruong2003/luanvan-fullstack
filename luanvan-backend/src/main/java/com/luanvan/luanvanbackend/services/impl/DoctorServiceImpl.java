package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.DoctorDTO;
import com.luanvan.luanvanbackend.dto.DoctorUpdateDTO;
import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.entities.DoctorSpecialty;
import com.luanvan.luanvanbackend.entities.Specialty;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.DoctorRepository;
import com.luanvan.luanvanbackend.repositories.DoctorSpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.SpecialtyRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SpecialtyRepository specialtyRepository;
    
    @Autowired
    private DoctorSpecialtyRepository doctorSpecialtyRepository;

    @Override
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
    }

    @Override
    public Doctor getDoctorByUserId(Long userId) {
        // Kiểm tra userID có tồn tại hay không
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + userId);
        }
        
        // Trong này giả sử doctorId = userId (vì Doctor có quan hệ 1-1 với User với doctorId = userId)
        return doctorRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ cho người dùng với ID: " + userId));
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Page<Doctor> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable);
    }

    @Override
    public Page<Doctor> getDoctorsBySpecialty(Long specialtyId, Pageable pageable) {
        // Kiểm tra specialtyId có tồn tại hay không
        if (!specialtyRepository.existsById(specialtyId)) {
            throw new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId);
        }
        
        return doctorRepository.findBySpecialtyId(specialtyId, pageable);
    }

    @Override
    public Page<Doctor> searchDoctorsByName(String name, Pageable pageable) {
        return doctorRepository.findByUserFullNameContainingIgnoreCase(name, pageable);
    }

    @Override
    public Page<Doctor> getDoctorsByExperience(int yearsOfExperience, Pageable pageable) {
        // Chưa có phương thức có sẵn trong repository, nên cần bổ sung
        // Hoặc chúng ta có thể lấy tất cả và lọc sau
        List<Doctor> doctors = doctorRepository.findByYearsOfExperienceGreaterThanEqual(yearsOfExperience);
        
        // Cần bổ sung phương thức phù hợp trong repository để hỗ trợ phân trang
        // Giả sử đã có phương thức này
        // return doctorRepository.findByYearsOfExperienceGreaterThanEqual(yearsOfExperience, pageable);
        
        // Giải pháp tạm thời: Sử dụng kết quả không phân trang và chuyển đổi thủ công
        // Đây không phải cách tối ưu và cần được cải thiện
        return null; // TODO: Cần được thay thế bằng phương thức repository phù hợp
    }

    @Override
    @Transactional
    public Doctor createDoctor(Long userId, DoctorDTO doctorDTO) {
        // Kiểm tra userID có tồn tại hay không
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra xem đã tồn tại hồ sơ bác sĩ cho người dùng này chưa
        if (doctorRepository.existsById(userId)) {
            throw new RuntimeException("Đã tồn tại hồ sơ bác sĩ cho người dùng với ID: " + userId);
        }
        
        // Tạo hồ sơ bác sĩ mới
        Doctor doctor = new Doctor();
        doctor.setDoctorId(userId); // Sử dụng userId làm doctorId (quan hệ 1-1)
        doctor.setUser(user);
        doctor.setBio(doctorDTO.getBio());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        doctor.setProfilePictureURL(doctorDTO.getProfilePictureURL());
        
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        // Gán các chuyên khoa nếu có
        if (doctorDTO.getSpecialtyIds() != null && !doctorDTO.getSpecialtyIds().isEmpty()) {
            for (Long specialtyId : doctorDTO.getSpecialtyIds()) {
                // Kiểm tra chuyên khoa có tồn tại hay không
                Specialty specialty = specialtyRepository.findById(specialtyId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId));
                
                // Tạo liên kết bác sĩ - chuyên khoa
                DoctorSpecialty doctorSpecialty = new DoctorSpecialty();
                doctorSpecialty.setDoctor(savedDoctor);
                doctorSpecialty.setSpecialty(specialty);
                
                // Kiểm tra nếu là chuyên khoa chính
                if (doctorDTO.getPrimarySpecialtyId() != null && 
                        doctorDTO.getPrimarySpecialtyId().equals(specialtyId)) {
                    doctorSpecialty.setPrimary(true);
                } else {
                    doctorSpecialty.setPrimary(false);
                }
                
                doctorSpecialtyRepository.save(doctorSpecialty);
            }
        }
        
        return savedDoctor;
    }

    @Override
    public Doctor updateDoctor(Long doctorId, DoctorUpdateDTO doctorUpdateDTO) {
        Doctor doctor = getDoctorById(doctorId);
        
        // Cập nhật thông tin
        if (doctorUpdateDTO.getBio() != null) {
            doctor.setBio(doctorUpdateDTO.getBio());
        }
        
        if (doctorUpdateDTO.getYearsOfExperience() != null) {
            doctor.setYearsOfExperience(doctorUpdateDTO.getYearsOfExperience());
        }
        
        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor updateProfilePicture(Long doctorId, String profilePictureURL) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.setProfilePictureURL(profilePictureURL);
        return doctorRepository.save(doctor);
    }

    @Override
    @Transactional
    public boolean assignSpecialty(Long doctorId, Long specialtyId, boolean isPrimary) {
        // Kiểm tra bác sĩ và chuyên khoa có tồn tại hay không
        Doctor doctor = getDoctorById(doctorId);
        Specialty specialty = specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId));
        
        // Kiểm tra xem đã có liên kết này chưa
        DoctorSpecialty existingLink = doctorSpecialtyRepository
                .findByDoctorDoctorIdAndSpecialtySpecialtyId(doctorId, specialtyId);
        
        if (existingLink != null) {
            // Cập nhật trạng thái primary nếu khác
            if (existingLink.isPrimary() != isPrimary) {
                // Nếu đang đặt chuyên khoa mới là primary, hủy primary cũ
                if (isPrimary) {
                    List<DoctorSpecialty> primarySpecialties = doctorSpecialtyRepository.findByDoctorDoctorIdAndIsPrimaryTrue(doctorId);
                    for (DoctorSpecialty ds : primarySpecialties) {
                        ds.setPrimary(false);
                        doctorSpecialtyRepository.save(ds);
                    }
                }
                
                existingLink.setPrimary(isPrimary);
                doctorSpecialtyRepository.save(existingLink);
            }
        } else {
            // Tạo liên kết mới
            DoctorSpecialty newLink = new DoctorSpecialty();
            newLink.setDoctor(doctor);
            newLink.setSpecialty(specialty);
            
            // Nếu đang đặt chuyên khoa mới là primary, hủy primary cũ
            if (isPrimary) {
                List<DoctorSpecialty> primarySpecialties = doctorSpecialtyRepository.findByDoctorDoctorIdAndIsPrimaryTrue(doctorId);
                for (DoctorSpecialty ds : primarySpecialties) {
                    ds.setPrimary(false);
                    doctorSpecialtyRepository.save(ds);
                }
            }
            
            newLink.setPrimary(isPrimary);
            doctorSpecialtyRepository.save(newLink);
        }
        
        return true;
    }

    @Override
    @Transactional
    public boolean removeSpecialty(Long doctorId, Long specialtyId) {
        // Kiểm tra bác sĩ và chuyên khoa có tồn tại hay không
        Doctor doctor = getDoctorById(doctorId);
        Specialty specialty = specialtyRepository.findById(specialtyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên khoa với ID: " + specialtyId));
        
        // Kiểm tra xem có liên kết này không
        DoctorSpecialty existingLink = doctorSpecialtyRepository
                .findByDoctorDoctorIdAndSpecialtySpecialtyId(doctorId, specialtyId);
        
        if (existingLink == null) {
            throw new RuntimeException("Không tìm thấy liên kết giữa bác sĩ ID: " + doctorId + 
                    " và chuyên khoa ID: " + specialtyId);
        }
        
        // Xóa liên kết
        doctorSpecialtyRepository.delete(existingLink);
        return true;
    }

    @Override
    public List<Object> getDoctorSpecialties(Long doctorId) {
        // Kiểm tra bác sĩ có tồn tại hay không
        Doctor doctor = getDoctorById(doctorId);
        
        // Lấy danh sách liên kết
        List<DoctorSpecialty> doctorSpecialties = doctorSpecialtyRepository.findByDoctorDoctorId(doctorId);
        
        // Chuyển đổi thành danh sách chuyên khoa
        List<Object> specialties = new ArrayList<>();
        for (DoctorSpecialty ds : doctorSpecialties) {
            // Tạo một đối tượng kết quả chứa thông tin chuyên khoa và trạng thái primary
            // Ở đây sử dụng Object để linh hoạt, trong thực tế nên tạo DTO riêng
            specialties.add(ds.getSpecialty());
        }
        
        return specialties;
    }
} 
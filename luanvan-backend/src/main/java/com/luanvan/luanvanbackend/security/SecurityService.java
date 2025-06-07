package com.luanvan.luanvanbackend.security;

import com.luanvan.luanvanbackend.entities.Doctor;
import com.luanvan.luanvanbackend.repositories.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecurityService {
    
    private final DoctorRepository doctorRepository;
    
    /**
     * Kiểm tra xem user hiện tại có quyền cập nhật doctor profile này không
     * @param doctorId ID của bác sĩ
     * @return true nếu có quyền cập nhật
     */
    public boolean canUpdateDoctor(Long doctorId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
                return false;
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Long currentUserId = userPrincipal.getUserId();
            
            // Kiểm tra doctor có tồn tại không
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return false; // Doctor không tồn tại
            }
            
            // Kiểm tra user có phải là owner của doctor profile này không
            return doctor.getUser().getUserId().equals(currentUserId);
        } catch (Exception e) {
            // Nếu có lỗi gì thì trả về false
            return false;
        }
    }
} 
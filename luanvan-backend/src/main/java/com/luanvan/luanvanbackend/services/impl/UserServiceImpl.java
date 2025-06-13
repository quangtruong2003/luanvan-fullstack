package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ContactInfoUpdateDTO;
import com.luanvan.luanvanbackend.dto.UserResponseDTO;
import com.luanvan.luanvanbackend.dto.UserUpdateDTO;
import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.UserService;
import com.luanvan.luanvanbackend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    public UserResponseDTO getUserResponseDTOById(Long userId) {
        User user = getUserById(userId);
        return convertToResponseDTO(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public Page<UserResponseDTO> getAllUsersDTO(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToResponseDTO);
    }

    @Override
    public Page<User> getUsersByRole(Long roleId, Pageable pageable) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return userRepository.findByRole(role, pageable);
    }

    @Override
    public Page<UserResponseDTO> getUsersByRoleDTO(Long roleId, Pageable pageable) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return userRepository.findByRole(role, pageable).map(this::convertToResponseDTO);
    }

    @Override
    public User updateUser(Long userId, UserUpdateDTO userUpdateDTO) {
        User user = getUserById(userId);
        
        if (userUpdateDTO.getFullName() != null) {
            user.setFullName(userUpdateDTO.getFullName());
        }
        if (userUpdateDTO.getEmail() != null) {
            user.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getDateOfBirth() != null) {
            user.setDateOfBirth(userUpdateDTO.getDateOfBirth());
        }
        if (userUpdateDTO.getGender() != null) {
            user.setGender(userUpdateDTO.getGender());
        }
        if (userUpdateDTO.getAddress() != null) {
            user.setAddress(userUpdateDTO.getAddress());
        }

        return userRepository.save(user);
    }

    @Override
    public User updateContactInfo(Long userId, ContactInfoUpdateDTO contactInfo) {
        User user = getUserById(userId);
        
        // Kiểm tra và cập nhật số điện thoại
        if (contactInfo.getPhoneNumber() != null && !contactInfo.getPhoneNumber().isEmpty()) {
            // Kiểm tra số điện thoại đã tồn tại chưa (nếu khác số hiện tại)
            if (!contactInfo.getPhoneNumber().equals(user.getPhoneNumber()) && 
                    userRepository.existsByPhoneNumber(contactInfo.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi người dùng khác");
            }
            user.setPhoneNumber(contactInfo.getPhoneNumber());
        }
        
        // Kiểm tra và cập nhật email
        if (contactInfo.getEmail() != null && !contactInfo.getEmail().isEmpty()) {
            // Kiểm tra email đã tồn tại chưa (nếu khác email hiện tại)
            if (!contactInfo.getEmail().equals(user.getEmail()) && 
                    userRepository.existsByEmail(contactInfo.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(contactInfo.getEmail());
        }
        
        // Cập nhật tên nếu có
        if (contactInfo.getFullName() != null && !contactInfo.getFullName().isEmpty()) {
            user.setFullName(contactInfo.getFullName());
        }
        
        // Cập nhật địa chỉ nếu có
        if (contactInfo.getAddress() != null && !contactInfo.getAddress().isEmpty()) {
            user.setAddress(contactInfo.getAddress());
        }
        
        return userRepository.save(user);
    }

    @Override
    public boolean hasRequiredContactInfo(Long userId) {
        User user = getUserById(userId);
        
        // Để đặt lịch, người dùng cần có ít nhất email hoặc số điện thoại
        boolean hasEmail = user.getEmail() != null && !user.getEmail().trim().isEmpty();
        boolean hasPhone = user.getPhoneNumber() != null && !user.getPhoneNumber().trim().isEmpty();
        
        return hasEmail || hasPhone;
    }

    @Override
    public List<String> getMissingContactInfo(Long userId) {
        User user = getUserById(userId);
        List<String> missingInfo = new ArrayList<>();
        
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            missingInfo.add("email");
        }
        
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            missingInfo.add("phoneNumber");
        }
        
        return missingInfo;
    }

    @Override
    public boolean deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(false);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean activateUser(Long userId) {
        User user = getUserById(userId);
        user.setActive(true);
        userRepository.save(user);
        return true;
    }

    @Override
    public User changeUserRole(Long userId, Long roleId) {
        User user = getUserById(userId);
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò với ID: " + roleId));
        
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public Page<UserResponseDTO> searchUsers(String keyword, String role, Pageable pageable) {
        if (role != null && !role.trim().isEmpty()) {
            // Nếu có role, tìm kiếm trong role đó
            if (keyword != null && !keyword.trim().isEmpty()) {
                // Tìm kiếm theo cả keyword và role
                return userRepository.searchUsersWithRole(keyword, role, pageable)
                        .map(this::convertToResponseDTO);
            } else {
                // Chỉ tìm kiếm theo role
                return userRepository.findByRoleNamePageable(role, pageable)
                        .map(this::convertToResponseDTO);
            }
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            // Chỉ tìm kiếm theo keyword
            return userRepository.searchUsers(keyword, pageable)
                    .map(this::convertToResponseDTO);
        } else {
            // Không có điều kiện tìm kiếm, trả về tất cả
            return userRepository.findAll(pageable)
                    .map(this::convertToResponseDTO);
        }
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .imageUrl(user.getImageUrl())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .active(user.isActive())
                .build();
    }
} 
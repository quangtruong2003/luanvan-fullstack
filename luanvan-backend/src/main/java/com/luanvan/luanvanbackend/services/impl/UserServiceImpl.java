package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.ContactInfoUpdateDTO;
import com.luanvan.luanvanbackend.dto.UserUpdateDTO;
import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.UserService;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
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
    public Page<User> getUsersByRole(Long roleId, Pageable pageable) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò với ID: " + roleId));
        
        // Giả sử chúng ta thêm method findByRole trong UserRepository
        // Sẽ cần bổ sung method này vào UserRepository
        // return userRepository.findByRole(role, pageable);
        
        // Hoặc sử dụng method có sẵn trong Spring Data JPA
        return userRepository.findByRole(role, pageable);
    }

    @Override
    public User updateUser(Long userId, UserUpdateDTO userUpdateDTO) {
        User user = getUserById(userId);
        
        // Cập nhật thông tin
        if (userUpdateDTO.getFullName() != null) {
            user.setFullName(userUpdateDTO.getFullName());
        }
        
        if (userUpdateDTO.getEmail() != null) {
            // Kiểm tra email đã tồn tại chưa (nếu khác email hiện tại)
            if (!userUpdateDTO.getEmail().equals(user.getEmail()) && 
                    userRepository.existsByEmail(userUpdateDTO.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
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
} 
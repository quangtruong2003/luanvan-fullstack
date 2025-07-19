package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.ContactInfoUpdateDTO;
import com.luanvan.luanvanbackend.dto.UserResponseDTO;
import com.luanvan.luanvanbackend.dto.UserUpdateDTO;
import com.luanvan.luanvanbackend.entities.User;
import com.luanvan.luanvanbackend.exception.MissingContactInfoException;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;/**
     * Lấy thông tin người dùng hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String identifier = authentication.getName();
        
        // Thử tìm theo email trước (admin/doctor)
        try {
            User user = userService.getUserByEmail(identifier);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            // Nếu không tìm thấy theo email, thử phone number (patient)
            try {
                User user = userService.getUserByPhoneNumber(identifier);
                return ResponseEntity.ok(user);
            } catch (Exception ex) {
                // Thử tìm theo Clerk User ID 
                try {
                    Optional<User> userByClerkId = userRepository.findByClerkUserId(identifier);
                    if (userByClerkId.isPresent()) {
                        return ResponseEntity.ok(userByClerkId.get());
                    }
                } catch (Exception clerkEx) {
                    // Log error but continue
                }
                
                throw new RuntimeException("Không tìm thấy người dùng với identifier: " + identifier);
            }
        }
    }

    /**
     * Tìm kiếm người dùng (chỉ Admin)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(keyword, role, pageable));
    }

    /**
     * Lấy thông tin người dùng theo ID (chỉ Admin hoặc chính người dùng đó)
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @userController.isCurrentUser(#userId, authentication)")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserResponseDTOById(userId));
    }

    /**
     * Lấy danh sách tất cả người dùng (chỉ Admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsersDTO(pageable));
    }

    /**
     * Lấy danh sách người dùng theo vai trò (chỉ Admin)
     */
    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByRole(
            @PathVariable Long roleId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(userService.getUsersByRoleDTO(roleId, pageable));
    }

    /**
     * Cập nhật thông tin người dùng (Admin hoặc chính người dùng đó)
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @userController.isCurrentUser(#userId, authentication)")
    public ResponseEntity<User> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        User user = userService.updateUser(userId, userUpdateDTO);
        return ResponseEntity.ok(user);
    }

    /**
     * Cập nhật thông tin liên hệ của người dùng (Admin hoặc chính người dùng đó)
     */
    @PutMapping("/{userId}/contact-info")
    @PreAuthorize("hasRole('ADMIN') or @userController.isCurrentUser(#userId, authentication)")
    public ResponseEntity<User> updateContactInfo(
            @PathVariable Long userId,
            @Valid @RequestBody ContactInfoUpdateDTO contactInfo) {
        User user = userService.updateContactInfo(userId, contactInfo);
        return ResponseEntity.ok(user);
    }

    /**
     * Kiểm tra thông tin liên hệ của người dùng (Admin hoặc chính người dùng đó)
     */
    @GetMapping("/{userId}/contact-info/check")
    @PreAuthorize("hasRole('ADMIN') or @userController.isCurrentUser(#userId, authentication)")
    public ResponseEntity<Map<String, Object>> checkContactInfo(@PathVariable Long userId) {
        boolean hasRequiredInfo = userService.hasRequiredContactInfo(userId);
        List<String> missingInfo = userService.getMissingContactInfo(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasRequiredContactInfo", hasRequiredInfo);
        response.put("missingContactInfo", missingInfo);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Vô hiệu hóa tài khoản người dùng (chỉ Admin)
     */
    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deactivateUser(@PathVariable Long userId) {
        boolean success = userService.deactivateUser(userId);
        if (success) {
            return ResponseEntity.ok("Đã vô hiệu hóa tài khoản thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể vô hiệu hóa tài khoản");
        }
    }

    /**
     * Kích hoạt tài khoản người dùng (chỉ Admin)
     */
    @PutMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> activateUser(@PathVariable Long userId) {
        boolean success = userService.activateUser(userId);
        if (success) {
            return ResponseEntity.ok("Đã kích hoạt tài khoản thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể kích hoạt tài khoản");
        }
    }

    /**
     * Thay đổi vai trò của người dùng (chỉ Admin)
     */
    @PutMapping("/{userId}/role/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")    public ResponseEntity<User> changeUserRole(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        User user = userService.changeUserRole(userId, roleId);
        return ResponseEntity.ok(user);
    }

    /**
     * Kiểm tra sự tồn tại của email (chỉ Admin)
     */
    @GetMapping("/check-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method để kiểm tra user hiện tại có phải là user được yêu cầu không
     */
    public boolean isCurrentUser(Long userId, org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.luanvan.luanvanbackend.security.UserPrincipal) {
            com.luanvan.luanvanbackend.security.UserPrincipal userPrincipal = 
                (com.luanvan.luanvanbackend.security.UserPrincipal) authentication.getPrincipal();
            return userId.equals(userPrincipal.getUserId());
        }
        return false;
    }
}
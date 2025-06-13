package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.ContactInfoUpdateDTO;
import com.luanvan.luanvanbackend.dto.UserResponseDTO;
import com.luanvan.luanvanbackend.dto.UserUpdateDTO;
import com.luanvan.luanvanbackend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    
    /**
     * Lấy thông tin người dùng theo ID
     * @param userId ID của người dùng
     * @return Thông tin chi tiết của người dùng
     */
    User getUserById(Long userId);
    
    /**
     * Lấy thông tin người dùng theo ID dưới dạng DTO
     * @param userId ID của người dùng
     * @return Thông tin người dùng DTO
     */
    UserResponseDTO getUserResponseDTOById(Long userId);
    
    /**
     * Lấy danh sách tất cả người dùng
     * @return Danh sách tất cả người dùng
     */
    List<User> getAllUsers();
    
    /**
     * Lấy danh sách người dùng có phân trang
     * @param pageable Thông tin phân trang
     * @return Danh sách người dùng có phân trang
     */
    Page<User> getAllUsers(Pageable pageable);
    
    /**
     * Lấy danh sách người dùng có phân trang dưới dạng DTO
     * @param pageable Thông tin phân trang
     * @return Danh sách người dùng DTO có phân trang
     */
    Page<UserResponseDTO> getAllUsersDTO(Pageable pageable);
    
    /**
     * Lấy danh sách người dùng theo vai trò
     * @param roleId ID của vai trò
     * @param pageable Thông tin phân trang
     * @return Danh sách người dùng có vai trò tương ứng
     */
    Page<User> getUsersByRole(Long roleId, Pageable pageable);
    
    /**
     * Lấy danh sách người dùng theo vai trò dưới dạng DTO
     * @param roleId ID của vai trò
     * @param pageable Thông tin phân trang
     * @return Danh sách người dùng DTO có vai trò tương ứng
     */
    Page<UserResponseDTO> getUsersByRoleDTO(Long roleId, Pageable pageable);
    
    /**
     * Cập nhật thông tin người dùng
     * @param userId ID của người dùng cần cập nhật
     * @param userUpdateDTO Thông tin cập nhật
     * @return Thông tin người dùng sau khi cập nhật
     */
    User updateUser(Long userId, UserUpdateDTO userUpdateDTO);
    
    /**
     * Cập nhật thông tin liên hệ của người dùng
     * @param userId ID của người dùng
     * @param contactInfo Thông tin liên hệ mới
     * @return Thông tin người dùng sau khi cập nhật
     */
    User updateContactInfo(Long userId, ContactInfoUpdateDTO contactInfo);
    
    /**
     * Kiểm tra người dùng có đủ thông tin liên hệ để đặt lịch không
     * @param userId ID của người dùng
     * @return true nếu có đủ thông tin, false nếu thiếu thông tin
     */
    boolean hasRequiredContactInfo(Long userId);
    
    /**
     * Lấy thông tin liên hệ còn thiếu của người dùng
     * @param userId ID của người dùng
     * @return Danh sách thông tin còn thiếu
     */
    List<String> getMissingContactInfo(Long userId);
    
    /**
     * Vô hiệu hóa tài khoản người dùng
     * @param userId ID của người dùng cần vô hiệu hóa
     * @return true nếu vô hiệu hóa thành công
     */
    boolean deactivateUser(Long userId);
    
    /**
     * Kích hoạt tài khoản người dùng
     * @param userId ID của người dùng cần kích hoạt
     * @return true nếu kích hoạt thành công
     */
    boolean activateUser(Long userId);
    
    /**
     * Thay đổi vai trò của người dùng
     * @param userId ID của người dùng
     * @param roleId ID vai trò mới
     * @return Thông tin người dùng sau khi cập nhật vai trò
     */
    User changeUserRole(Long userId, Long roleId);
    
    /**
     * Tìm kiếm người dùng theo từ khóa và vai trò
     * @param keyword Từ khóa tìm kiếm (tên, email, số điện thoại)
     * @param role Tên vai trò (PATIENT, DOCTOR, ADMIN)
     * @param pageable Thông tin phân trang
     * @return Danh sách người dùng tìm thấy
     */
    Page<UserResponseDTO> searchUsers(String keyword, String role, Pageable pageable);
} 
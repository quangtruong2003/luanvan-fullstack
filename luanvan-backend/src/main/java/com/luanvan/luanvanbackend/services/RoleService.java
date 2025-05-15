package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Role;

import java.util.List;

public interface RoleService {
    
    /**
     * Lấy vai trò theo ID
     * @param roleId ID của vai trò
     * @return Thông tin vai trò
     */
    Role getRoleById(Long roleId);
    
    /**
     * Lấy vai trò theo tên
     * @param roleName Tên vai trò
     * @return Thông tin vai trò
     */
    Role getRoleByName(String roleName);
    
    /**
     * Lấy tất cả vai trò trong hệ thống
     * @return Danh sách vai trò
     */
    List<Role> getAllRoles();
    
    /**
     * Tạo vai trò mới
     * @param roleName Tên vai trò mới
     * @return Vai trò đã được tạo
     */
    Role createRole(String roleName);
    
    /**
     * Cập nhật tên vai trò
     * @param roleId ID của vai trò
     * @param newRoleName Tên mới của vai trò
     * @return Vai trò sau khi cập nhật
     */
    Role updateRole(Long roleId, String newRoleName);
    
    /**
     * Xóa vai trò
     * @param roleId ID của vai trò
     * @return true nếu xóa thành công
     */
    boolean deleteRole(Long roleId);
} 
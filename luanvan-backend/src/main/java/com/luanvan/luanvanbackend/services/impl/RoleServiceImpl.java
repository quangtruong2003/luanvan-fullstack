package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.repositories.RoleRepository;
import com.luanvan.luanvanbackend.repositories.UserRepository;
import com.luanvan.luanvanbackend.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public Role getRoleById(Long roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò với ID: " + roleId));
    }

    @Override
    public Role getRoleByName(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò với tên: " + roleName));
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role createRole(String roleName) {
        // Kiểm tra tên vai trò đã tồn tại chưa
        if (roleRepository.findByRoleName(roleName).isPresent()) {
            throw new RuntimeException("Vai trò '" + roleName + "' đã tồn tại");
        }
        
        Role newRole = new Role();
        newRole.setRoleName(roleName);
        return roleRepository.save(newRole);
    }

    @Override
    public Role updateRole(Long roleId, String newRoleName) {
        Role role = getRoleById(roleId);
        
        // Kiểm tra tên vai trò mới đã tồn tại chưa (khác với vai trò hiện tại)
        if (!role.getRoleName().equals(newRoleName) && 
                roleRepository.findByRoleName(newRoleName).isPresent()) {
            throw new RuntimeException("Vai trò '" + newRoleName + "' đã tồn tại");
        }
        
        role.setRoleName(newRoleName);
        return roleRepository.save(role);
    }

    @Override
    public boolean deleteRole(Long roleId) {
        Role role = getRoleById(roleId);
        
        // Kiểm tra xem vai trò còn được sử dụng bởi người dùng nào không
        if (userRepository.findByRole(role, null).getTotalElements() > 0) {
            throw new RuntimeException("Không thể xóa vai trò vì đang được sử dụng bởi người dùng");
        }
        
        roleRepository.delete(role);
        return true;
    }
} 
package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.services.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * Lấy danh sách tất cả vai trò (chỉ Admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * Lấy thông tin vai trò theo ID (chỉ Admin)
     */
    @GetMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRoleById(@PathVariable Long roleId) {
        Role role = roleService.getRoleById(roleId);
        return ResponseEntity.ok(role);
    }

    /**
     * Lấy thông tin vai trò theo tên (chỉ Admin)
     */
    @GetMapping("/name/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRoleByName(@PathVariable String roleName) {
        Role role = roleService.getRoleByName(roleName);
        return ResponseEntity.ok(role);
    }

    /**
     * Tạo vai trò mới (chỉ Admin)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> createRole(@RequestParam String roleName) {
        Role role = roleService.createRole(roleName);
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    /**
     * Cập nhật tên vai trò (chỉ Admin)
     */
    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> updateRole(
            @PathVariable Long roleId,
            @RequestParam String newRoleName) {
        Role role = roleService.updateRole(roleId, newRoleName);
        return ResponseEntity.ok(role);
    }

    /**
     * Xóa vai trò (chỉ Admin)
     */
    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteRole(@PathVariable Long roleId) {
        boolean success = roleService.deleteRole(roleId);
        if (success) {
            return ResponseEntity.ok("Đã xóa vai trò thành công");
        } else {
            return ResponseEntity.badRequest().body("Không thể xóa vai trò");
        }
    }
} 
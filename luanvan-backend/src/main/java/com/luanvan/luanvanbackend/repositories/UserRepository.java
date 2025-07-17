package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Role;
import com.luanvan.luanvanbackend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Basic lookups
    Optional<User> findByEmail(String email);
    Optional<User> findByClerkUserId(String clerkUserId);
    Optional<User> findByPhoneNumber(String phoneNumber);

    // Simple role-based queries
    @Query("SELECT u FROM User u WHERE u.role.roleName = :roleName ORDER BY u.fullName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.role.roleName = :roleName ORDER BY u.fullName")
    Page<User> findByRoleNamePageable(@Param("roleName") String roleName, Pageable pageable);

    // Search functionality
    @Query("""
        SELECT u FROM User u 
        WHERE (:keyword IS NULL OR :keyword = '' 
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR u.phoneNumber LIKE CONCAT('%', :keyword, '%'))
        ORDER BY u.fullName
        """)
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);

    // Search with role filter
    @Query("""
        SELECT u FROM User u 
        WHERE u.role.roleName = :roleName
        AND (:keyword IS NULL OR :keyword = '' 
             OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR u.phoneNumber LIKE CONCAT('%', :keyword, '%'))
        ORDER BY u.fullName
        """)
    Page<User> searchUsersWithRole(@Param("keyword") String keyword, @Param("roleName") String roleName, Pageable pageable);

    // Contact information validation
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.userId = :userId AND u.phoneNumber IS NOT NULL AND u.email IS NOT NULL")
    boolean hasRequiredContactInfo(@Param("userId") Long userId);

    // Statistics
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.roleName = :roleName")
    Long countByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u.role.roleName, COUNT(u) FROM User u GROUP BY u.role.roleName")
    List<Object[]> getUserCountByRole();

    // Admin email list for notifications
    @Query("""
        SELECT u.email FROM User u 
        WHERE u.role.roleName = 'ADMIN' 
        AND u.isActive = true 
        AND u.email IS NOT NULL
        """)
    List<String> findAdminEmails();

    // Existence checks
    boolean existsByEmail(String email);
    boolean existsByClerkUserId(String clerkUserId);
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND (:excludeUserId IS NULL OR u.userId != :excludeUserId)")
    boolean existsByEmailExcludingUserId(@Param("email") String email, @Param("excludeUserId") Long excludeUserId);

    // Role-based operations
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") Role role);
    
    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.fullName")
    Page<User> findByRole(@Param("role") Role role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.fullName")
    List<User> findByRole(@Param("role") Role role);
}

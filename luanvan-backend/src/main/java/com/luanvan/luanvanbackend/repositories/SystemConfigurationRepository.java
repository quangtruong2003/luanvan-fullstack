package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Long> {
    // Thường chỉ có một bản ghi cấu hình, nhưng vẫn cung cấp các phương thức tiện ích
    SystemConfiguration findFirstByOrderByConfigIdAsc();
} 
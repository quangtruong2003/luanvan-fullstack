package com.luanvan.luanvanbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.luanvan.luanvanbackend.repositories")
@EnableTransactionManagement
public class JpaConfig {
    // Class này để trống.
    // Spring Boot sẽ tự động cấu hình các bean cần thiết cho JPA.
} 
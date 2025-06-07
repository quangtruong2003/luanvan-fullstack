package com.luanvan.luanvanbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.File;

// @Component - Tạm thời disable để debug
public class CustomHealthIndicator implements HealthIndicator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            // Check database connection
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            // Check upload directory
            File uploadDir = new File("uploads");
            boolean uploadDirExists = uploadDir.exists() && uploadDir.isDirectory();
            
            // Check logs directory
            File logsDir = new File("logs");
            boolean logsDirExists = logsDir.exists() && logsDir.isDirectory();
            
            // Build health status
            Health.Builder builder = Health.up()
                    .withDetail("database", "Connected")
                    .withDetail("uploadDirectory", uploadDirExists ? "Available" : "Not Found")
                    .withDetail("logsDirectory", logsDirExists ? "Available" : "Not Found");
            
            // Check disk space
            File diskPartition = new File("/");
            long freeSpace = diskPartition.getFreeSpace() / (1024 * 1024 * 1024); // GB
            builder.withDetail("freeSpaceGB", freeSpace);
            
            if (freeSpace < 1) {
                return builder.status("WARNING").withDetail("warning", "Low disk space").build();
            }
            
            return builder.build();
            
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
} 
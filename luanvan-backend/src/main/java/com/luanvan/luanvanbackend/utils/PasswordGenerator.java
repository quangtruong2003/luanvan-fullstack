package com.luanvan.luanvanbackend.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminPassword = encoder.encode("admin");
        String doctorPassword = encoder.encode("doctor");
        
        System.out.println("Admin password hash: " + adminPassword);
        System.out.println("Doctor password hash: " + doctorPassword);
        
        // SQL statements
        System.out.println("\nSQL statements for manual insertion:");
        System.out.println("--------------------------------------------------------------------------");
        System.out.println("-- Insert roles if not exists");
        System.out.println("INSERT INTO roles (role_name) VALUES ('ADMIN') ON DUPLICATE KEY UPDATE role_name=role_name;");
        System.out.println("INSERT INTO roles (role_name) VALUES ('DOCTOR') ON DUPLICATE KEY UPDATE role_name=role_name;");
        System.out.println("INSERT INTO roles (role_name) VALUES ('PATIENT') ON DUPLICATE KEY UPDATE role_name=role_name;");
        System.out.println("INSERT INTO roles (role_name) VALUES ('STAFF') ON DUPLICATE KEY UPDATE role_name=role_name;");
        System.out.println();
        System.out.println("-- Get role IDs (replace with actual IDs)");
        System.out.println("-- SELECT * FROM roles;");
        System.out.println();
        System.out.println("-- Insert admin user (replace 1 with actual ADMIN role_id)");
        System.out.println("INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)");
        System.out.println("VALUES ('admin@example.com', 'admin', '" + adminPassword + "', 'Quản trị viên', NOW(), 1, 1);");
        System.out.println();
        System.out.println("-- Insert doctor user (replace 2 with actual DOCTOR role_id)");
        System.out.println("INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)");
        System.out.println("VALUES ('doctor@example.com', 'doctor', '" + doctorPassword + "', 'Bác sĩ', NOW(), 1, 2);");
        System.out.println("--------------------------------------------------------------------------");
    }
} 
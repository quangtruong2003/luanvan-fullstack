package com.luanvan.luanvanbackend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Mật khẩu gốc
        String rawPassword = "admin";
        
        // Hash từ Spring Security mặc định cho "admin"
        String knownHash = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
        
        // Hash mới
        String newHash = encoder.encode(rawPassword);
        
        System.out.println("Raw password: " + rawPassword);
        System.out.println("Known hash: " + knownHash);
        System.out.println("New hash: " + newHash);
        System.out.println("Does new hash match raw password? " + encoder.matches(rawPassword, newHash));
        System.out.println("Does known hash match raw password? " + encoder.matches(rawPassword, knownHash));
        
        // Test với passwords khác
        String[] passwords = {"admin", "doctor", "password"};
        for (String password : passwords) {
            System.out.println("\nTesting password: " + password);
            System.out.println("Does known hash match '" + password + "'? " + encoder.matches(password, knownHash));
        }
    }
} 
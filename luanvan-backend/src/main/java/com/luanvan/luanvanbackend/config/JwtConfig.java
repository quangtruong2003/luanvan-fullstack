package com.luanvan.luanvanbackend.config;

import com.luanvan.luanvanbackend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {
    @Value("${jwt.secret:thisisasecretkeyforsigningjwts}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}") // 24 giờ
    private long expiration;
    
    @Bean
    public JwtUtils jwtUtils() {
        return new JwtUtils(secret, expiration);
    }
} 
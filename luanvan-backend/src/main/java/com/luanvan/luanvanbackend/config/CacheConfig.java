package com.luanvan.luanvanbackend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
// @EnableCaching // Tạm thời tắt để tránh lỗi JCache
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Performance optimization với Caffeine
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(10, TimeUnit.MINUTES) // Expire sau 10 phút
                .expireAfterAccess(5, TimeUnit.MINUTES)  // Expire sau 5 phút không truy cập
                .recordStats()); // Enable statistics cho monitoring
        
        // Định nghĩa các cache names
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "clinics",
                "specialties", 
                "doctors",
                "articles",
                "systemConfig",
                "roles",
                "availabilitySlots",
                "doctorSpecialties",
                "userProfiles"
        ));
        
        return cacheManager;
    }
    
    // Cache cho dữ liệu ít thay đổi (như system config)
    @Bean("longTermCacheManager")
    public CacheManager longTermCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(200)
                .expireAfterWrite(1, TimeUnit.HOURS) // Expire sau 1 giờ
                .recordStats());
        
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "systemConfig",
                "roles",
                "clinicsStatic"
        ));
        
        return cacheManager;
    }
} 
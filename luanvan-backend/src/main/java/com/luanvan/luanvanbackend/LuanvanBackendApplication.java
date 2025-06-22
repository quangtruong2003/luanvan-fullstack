package com.luanvan.luanvanbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class LuanvanBackendApplication {

    @PostConstruct
    public void init() {
        // Set default timezone cho JVM
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
    }

    public static void main(String[] args) {
        // Set timezone trước khi start application
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
        
        SpringApplication.run(LuanvanBackendApplication.class, args);
    }

}

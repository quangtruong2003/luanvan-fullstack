package com.luanvan.luanvanbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LuanvanBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LuanvanBackendApplication.class, args);
    }

}

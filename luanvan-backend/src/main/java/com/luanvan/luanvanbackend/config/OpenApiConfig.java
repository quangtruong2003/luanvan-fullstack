package com.luanvan.luanvanbackend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Hệ Thống Đặt Lịch Hẹn Y Tế - API Documentation",
                description = "REST API cho hệ thống đặt lịch hẹn y tế. Hỗ trợ quản lý bệnh nhân, bác sĩ, lịch hẹn và thanh toán.",
                version = "v1.0.0",
                contact = @Contact(
                        name = "Luận Văn Team",
                        email = "support@luanvan.com"
                ),
                license = @License(
                        name = "MIT License",
                        url = "https://opensource.org/licenses/MIT"
                )
        ),
        servers = {
                @Server(
                        description = "Development Environment",
                        url = "http://localhost:9090"
                ),
                @Server(
                        description = "Local Environment",
                        url = "http://127.0.0.1:9090"
                )
        }
)
@SecurityScheme(
        name = "Bearer Authentication",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "Nhập JWT token để xác thực. Token có thể lấy từ endpoint /api/auth/login"
)
public class OpenApiConfig {
} 
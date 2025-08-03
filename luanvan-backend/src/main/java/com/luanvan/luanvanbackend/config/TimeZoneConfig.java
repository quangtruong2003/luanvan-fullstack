package com.luanvan.luanvanbackend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

@Configuration
public class TimeZoneConfig {

    /**
     * Cấu hình múi giờ mặc định cho toàn bộ ứng dụng là UTC.
     * Điều này đảm bảo tính nhất quán về thời gian trên mọi môi trường triển khai (local, staging, production).
     * Việc chuyển đổi thời gian sang múi giờ của người dùng sẽ được xử lý ở phía Frontend.
     * Sử dụng {@link PostConstruct} để đảm bảo phương thức này được gọi ngay sau khi bean được khởi tạo.
     */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
}

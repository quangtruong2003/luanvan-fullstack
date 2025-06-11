package com.luanvan.luanvanbackend.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.config.MeterFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.function.Consumer;

@Configuration
public class MetricsConfig {

    @Bean
    public Consumer<MeterRegistry> metricsCommonTags() {
        return registry -> {
            registry.config()
                    .commonTags("application", "luanvan-backend")
                    .meterFilter(MeterFilter.deny(id -> {
                        String uri = id.getTag("uri");
                        return uri != null && uri.startsWith("/actuator");
                    }));
        };
    }

    @Bean
    public Timer customTimer(MeterRegistry meterRegistry) {
        return Timer.builder("custom.timer").register(meterRegistry);
    }
} 
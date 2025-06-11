package com.luanvan.luanvanbackend.services;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.util.HashMap;
import java.util.Map;

// @Service // Tạm thời disable để tránh lỗi compilation
@RequiredArgsConstructor
@Slf4j
public class PerformanceMonitoringService {

    private final MeterRegistry meterRegistry;
    private final JdbcTemplate jdbcTemplate;

    // Monitor method execution time
    public <T> T monitorMethod(String methodName, java.util.function.Supplier<T> method) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return method.get();
        } finally {
            sample.stop(Timer.builder("method.execution.time")
                    .tag("method", methodName)
                    .register(meterRegistry));
        }
    }

    // Monitor database query performance
    @Scheduled(fixedDelay = 60000) // Every minute
    public void monitorDatabasePerformance() {
        try {
            // Check active connections
            Integer activeConnections = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.PROCESSLIST WHERE COMMAND != 'Sleep'", 
                    Integer.class
            );
            meterRegistry.gauge("database.connections.active", activeConnections != null ? activeConnections : 0);

            // Check slow queries (example - adjust based on your MySQL setup)
            Integer slowQueries = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.PROCESSLIST WHERE TIME > 5", 
                    Integer.class
            );
            meterRegistry.gauge("database.queries.slow", slowQueries != null ? slowQueries : 0);

            log.debug("Database performance - Active connections: {}, Slow queries: {}", 
                     activeConnections, slowQueries);
        } catch (Exception e) {
            log.error("Error monitoring database performance", e);
        }
    }

    // Monitor JVM performance
    @Scheduled(fixedDelay = 30000) // Every 30 seconds
    public void monitorJvmPerformance() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();

        // Memory metrics
        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024);
        long heapMax = memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024);
        double heapUsagePercent = (double) heapUsed / heapMax * 100;

        meterRegistry.gauge("jvm.memory.heap.used.mb", heapUsed);
        meterRegistry.gauge("jvm.memory.heap.max.mb", heapMax);
        meterRegistry.gauge("jvm.memory.heap.usage.percent", heapUsagePercent);

        // Thread metrics
        int threadCount = threadBean.getThreadCount();
        int peakThreadCount = threadBean.getPeakThreadCount();

        meterRegistry.gauge("jvm.threads.count", threadCount);
        meterRegistry.gauge("jvm.threads.peak", peakThreadCount);

        log.debug("JVM performance - Heap usage: {}%, Threads: {}", 
                 String.format("%.2f", heapUsagePercent), threadCount);
    }

    // Get performance summary
    public Map<String, Object> getPerformanceSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();

        // Memory info
        summary.put("heapUsedMB", memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024));
        summary.put("heapMaxMB", memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024));
        summary.put("nonHeapUsedMB", memoryBean.getNonHeapMemoryUsage().getUsed() / (1024 * 1024));

        // Thread info
        summary.put("threadCount", threadBean.getThreadCount());
        summary.put("peakThreadCount", threadBean.getPeakThreadCount());

        // CPU info - Sử dụng standard API thay vì deprecated sun.management
        java.lang.management.OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        summary.put("availableProcessors", osBean.getAvailableProcessors());
        summary.put("systemLoadAverage", osBean.getSystemLoadAverage());

        return summary;
    }
} 
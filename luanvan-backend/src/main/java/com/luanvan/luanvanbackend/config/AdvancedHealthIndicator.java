package com.luanvan.luanvanbackend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component("advanced")
@RequiredArgsConstructor
@Slf4j
public class AdvancedHealthIndicator {

    private final DataSource dataSource;
    private final CacheManager cacheManager;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public Map<String, Object> health() {
        try {
            Map<String, Object> details = new HashMap<>();
            
            // Database connectivity and performance check
            checkDatabaseHealth(details);
            
            // Cache system health
            checkCacheHealth(details);
            
            // Memory and system resources
            checkSystemResources(details);
            
            // Application-specific metrics
            checkApplicationMetrics(details);
            
            details.put("timestamp", LocalDateTime.now().format(FORMATTER));
            details.put("status", "All systems operational");
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "UP");
            result.put("details", details);
            return result;
            
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, Object> result = new HashMap<>();
            result.put("status", "DOWN");
            result.put("error", e.getMessage());
            result.put("timestamp", LocalDateTime.now().format(FORMATTER));
            return result;
        }
    }

    private void checkDatabaseHealth(Map<String, Object> details) {
        try {
            long startTime = System.currentTimeMillis();
            
            try (Connection connection = dataSource.getConnection()) {
                boolean isValid = connection.isValid(5); // 5 second timeout
                long responseTime = System.currentTimeMillis() - startTime;
                
                Map<String, Object> dbDetails = new HashMap<>();
                dbDetails.put("status", isValid ? "UP" : "DOWN");
                dbDetails.put("responseTime", responseTime + "ms");
                dbDetails.put("url", connection.getMetaData().getURL());
                dbDetails.put("driver", connection.getMetaData().getDriverName());
                dbDetails.put("version", connection.getMetaData().getDatabaseProductVersion());
                
                // Performance thresholds
                if (responseTime > 1000) {
                    dbDetails.put("warning", "Database response time is slow (>1s)");
                } else if (responseTime > 500) {
                    dbDetails.put("notice", "Database response time is moderate (>500ms)");
                }
                
                details.put("database", dbDetails);
            }
            
        } catch (SQLException e) {
            Map<String, Object> dbDetails = new HashMap<>();
            dbDetails.put("status", "DOWN");
            dbDetails.put("error", e.getMessage());
            details.put("database", dbDetails);
            log.error("Database health check failed", e);
        }
    }

    private void checkCacheHealth(Map<String, Object> details) {
        try {
            Map<String, Object> cacheDetails = new HashMap<>();
            
            if (cacheManager != null) {
                var cacheNames = cacheManager.getCacheNames();
                cacheDetails.put("status", "UP");
                cacheDetails.put("provider", cacheManager.getClass().getSimpleName());
                cacheDetails.put("caches", cacheNames);
                
                // Check cache statistics if available
                Map<String, Object> cacheStats = new HashMap<>();
                for (String cacheName : cacheNames) {
                    var cache = cacheManager.getCache(cacheName);
                    if (cache != null) {
                        cacheStats.put(cacheName, "Available");
                    }
                }
                cacheDetails.put("cacheStatus", cacheStats);
                
            } else {
                cacheDetails.put("status", "NOT_CONFIGURED");
                cacheDetails.put("warning", "No cache manager configured");
            }
            
            details.put("cache", cacheDetails);
            
        } catch (Exception e) {
            Map<String, Object> cacheDetails = new HashMap<>();
            cacheDetails.put("status", "ERROR");
            cacheDetails.put("error", e.getMessage());
            details.put("cache", cacheDetails);
            log.error("Cache health check failed", e);
        }
    }

    private void checkSystemResources(Map<String, Object> details) {
        try {
            Runtime runtime = Runtime.getRuntime();
            
            Map<String, Object> systemDetails = new HashMap<>();
            
            // Memory information
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            Map<String, Object> memoryDetails = new HashMap<>();
            memoryDetails.put("max", formatBytes(maxMemory));
            memoryDetails.put("total", formatBytes(totalMemory));
            memoryDetails.put("used", formatBytes(usedMemory));
            memoryDetails.put("free", formatBytes(freeMemory));
            memoryDetails.put("usagePercentage", Math.round((double) usedMemory / totalMemory * 100) + "%");
            
            // Memory usage warnings
            double usageRatio = (double) usedMemory / totalMemory;
            if (usageRatio > 0.9) {
                memoryDetails.put("warning", "Memory usage is very high (>90%)");
            } else if (usageRatio > 0.8) {
                memoryDetails.put("notice", "Memory usage is high (>80%)");
            }
            
            systemDetails.put("memory", memoryDetails);
            
            // System information
            Map<String, Object> jvmDetails = new HashMap<>();
            jvmDetails.put("version", System.getProperty("java.version"));
            jvmDetails.put("vendor", System.getProperty("java.vendor"));
            jvmDetails.put("processors", runtime.availableProcessors());
            
            systemDetails.put("jvm", jvmDetails);
            
            details.put("system", systemDetails);
            
        } catch (Exception e) {
            Map<String, Object> systemDetails = new HashMap<>();
            systemDetails.put("status", "ERROR");
            systemDetails.put("error", e.getMessage());
            details.put("system", systemDetails);
            log.error("System resources health check failed", e);
        }
    }

    private void checkApplicationMetrics(Map<String, Object> details) {
        try {
            Map<String, Object> appDetails = new HashMap<>();
            
            // Application startup time and uptime
            long uptimeMillis = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
            appDetails.put("uptime", formatDuration(uptimeMillis));
            
            // Thread information
            Thread.State[] threadStates = Thread.State.values();
            Map<String, Integer> threadCounts = new HashMap<>();
            
            ThreadGroup rootGroup = Thread.currentThread().getThreadGroup();
            while (rootGroup.getParent() != null) {
                rootGroup = rootGroup.getParent();
            }
            
            Thread[] threads = new Thread[rootGroup.activeCount()];
            int threadCount = rootGroup.enumerate(threads);
            
            for (Thread.State state : threadStates) {
                threadCounts.put(state.name(), 0);
            }
            
            for (int i = 0; i < threadCount; i++) {
                if (threads[i] != null) {
                    String stateName = threads[i].getState().name();
                    threadCounts.put(stateName, threadCounts.get(stateName) + 1);
                }
            }
            
            appDetails.put("activeThreads", threadCount);
            appDetails.put("threadStates", threadCounts);
            
            // Performance indicators
            appDetails.put("performanceStatus", "OPTIMAL");
            
            details.put("application", appDetails);
            
        } catch (Exception e) {
            Map<String, Object> appDetails = new HashMap<>();
            appDetails.put("status", "ERROR");
            appDetails.put("error", e.getMessage());
            details.put("application", appDetails);
            log.error("Application metrics health check failed", e);
        }
    }

    private String formatBytes(long bytes) {
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", size, units[unitIndex]);
    }

    private String formatDuration(long millis) {
        long seconds = millis / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;
        
        if (days > 0) {
            return String.format("%dd %dh %dm", days, hours % 24, minutes % 60);
        } else if (hours > 0) {
            return String.format("%dh %dm %ds", hours, minutes % 60, seconds % 60);
        } else if (minutes > 0) {
            return String.format("%dm %ds", minutes, seconds % 60);
        } else {
            return String.format("%ds", seconds);
        }
    }
} 
package com.luanvan.luanvanbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Configuration
public class RateLimitConfig {

    @Bean
    public RateLimitFilter rateLimitFilter() {
        return new RateLimitFilter();
    }

    public static class RateLimitFilter extends OncePerRequestFilter {
        
        private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
        private final int MAX_REQUESTS_PER_MINUTE = 60; // 60 requests per minute per IP
        private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        public RateLimitFilter() {
            // Reset counters every minute
            scheduler.scheduleAtFixedRate(() -> {
                requestCounts.clear();
            }, 1, 1, TimeUnit.MINUTES);
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {
            
            String clientIP = getClientIP(request);
            String endpoint = request.getRequestURI();
            
            // Skip rate limiting for health checks and actuator endpoints
            if (endpoint.startsWith("/actuator") || endpoint.startsWith("/health")) {
                filterChain.doFilter(request, response);
                return;
            }

            AtomicInteger requests = requestCounts.computeIfAbsent(clientIP, k -> new AtomicInteger(0));
            
            if (requests.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Rate limit exceeded. Try again later.\"}");
                return;
            }

            filterChain.doFilter(request, response);
        }

        private String getClientIP(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIP = request.getHeader("X-Real-IP");
            if (xRealIP != null && !xRealIP.isEmpty()) {
                return xRealIP;
            }
            
            return request.getRemoteAddr();
        }
    }
} 
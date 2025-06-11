package com.luanvan.luanvanbackend.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Configuration
@Slf4j
public class ResilienceConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        return CircuitBreakerRegistry.ofDefaults();
    }

    @Bean
    public RetryRegistry retryRegistry() {
        return RetryRegistry.ofDefaults();
    }

    @Bean
    public CircuitBreaker databaseCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .slidingWindowSize(20)
                .minimumNumberOfCalls(10)
                .permittedNumberOfCallsInHalfOpenState(5)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("database", config);
        
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> 
                    log.info("Database CircuitBreaker state transition: {} -> {}", 
                            event.getStateTransition().getFromState(), 
                            event.getStateTransition().getToState()))
                .onSuccess(event -> 
                    log.debug("Database operation succeeded in {}ms", 
                            event.getElapsedDuration().toMillis()))
                .onError(event -> 
                    log.warn("Database operation failed: {}", 
                            event.getThrowable().getMessage()))
                .onCallNotPermitted(event -> 
                    log.warn("Database call not permitted - Circuit breaker is OPEN"));

        return circuitBreaker;
    }

    @Bean
    public CircuitBreaker emailCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(60)
                .waitDurationInOpenState(Duration.ofMinutes(2))
                .slidingWindowSize(10)
                .minimumNumberOfCalls(5)
                .permittedNumberOfCallsInHalfOpenState(3)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .recordExceptions(Exception.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("email", config);
        
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> 
                    log.info("Email CircuitBreaker state transition: {} -> {}", 
                            event.getStateTransition().getFromState(), 
                            event.getStateTransition().getToState()))
                .onCallNotPermitted(event -> 
                    log.warn("Email service call not permitted - Circuit breaker is OPEN. " +
                            "Email will be queued for later retry."));

        return circuitBreaker;
    }

    @Bean
    public CircuitBreaker paymentCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(40)
                .waitDurationInOpenState(Duration.ofMinutes(5))
                .slidingWindowSize(15)
                .minimumNumberOfCalls(8)
                .permittedNumberOfCallsInHalfOpenState(4)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class, IllegalStateException.class)
                .build();

        CircuitBreaker circuitBreaker = registry.circuitBreaker("payment", config);
        
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> {
                    log.warn("Payment CircuitBreaker state transition: {} -> {}. " +
                            "This may affect payment processing!", 
                            event.getStateTransition().getFromState(), 
                            event.getStateTransition().getToState());
                    
                    // You could add notification logic here for critical payment issues
                })
                .onCallNotPermitted(event -> 
                    log.error("Payment service call not permitted - Circuit breaker is OPEN! " +
                            "Manual intervention may be required."));

        return circuitBreaker;
    }

    @Bean
    public Retry databaseRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .retryOnException(throwable -> {
                    // Retry on transient database exceptions
                    String message = throwable.getMessage().toLowerCase();
                    return message.contains("connection") || 
                           message.contains("timeout") || 
                           message.contains("deadlock") ||
                           throwable instanceof TimeoutException;
                })
                .build();

        Retry retry = registry.retry("database", config);
        
        retry.getEventPublisher()
                .onRetry(event -> 
                    log.warn("Database operation retry #{}: {}", 
                            event.getNumberOfRetryAttempts(), 
                            event.getLastThrowable().getMessage()))
                .onSuccess(event -> 
                    log.info("Database operation succeeded after {} retries", 
                            event.getNumberOfRetryAttempts()));

        return retry;
    }

    @Bean
    public Retry emailRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(5)
                .waitDuration(Duration.ofSeconds(2))
                .retryOnException(throwable -> {
                    // Retry on transient email exceptions
                    String message = throwable.getMessage().toLowerCase();
                    return message.contains("smtp") || 
                           message.contains("timeout") || 
                           message.contains("connection") ||
                           message.contains("temporary");
                })
                .build();

        Retry retry = registry.retry("email", config);
        
        retry.getEventPublisher()
                .onRetry(event -> 
                    log.warn("Email sending retry #{}: {}", 
                            event.getNumberOfRetryAttempts(), 
                            event.getLastThrowable().getMessage()));

        return retry;
    }

    @Bean
    public Retry paymentRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(2)
                .waitDuration(Duration.ofSeconds(1))
                .retryOnException(throwable -> {
                    // Be very conservative with payment retries
                    String message = throwable.getMessage().toLowerCase();
                    return message.contains("network") || 
                           message.contains("timeout") ||
                           throwable instanceof TimeoutException;
                })
                .build();

        Retry retry = registry.retry("payment", config);
        
        retry.getEventPublisher()
                .onRetry(event -> 
                    log.warn("Payment operation retry #{}: {} - CAUTION: Payment retry detected!", 
                            event.getNumberOfRetryAttempts(), 
                            event.getLastThrowable().getMessage()));

        return retry;
    }

    @Bean
    public TimeLimiter defaultTimeLimiter() {
        TimeLimiterConfig config = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(5))
                .cancelRunningFuture(true)
                .build();

        return TimeLimiter.of("default", config);
    }

    @Bean
    public TimeLimiter paymentTimeLimiter() {
        TimeLimiterConfig config = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(10))
                .cancelRunningFuture(true)
                .build();

        TimeLimiter timeLimiter = TimeLimiter.of("payment", config);
        
        timeLimiter.getEventPublisher()
                .onTimeout(event -> 
                    log.error("Payment operation timeout after {}ms - This requires immediate attention!", 
                            config.getTimeoutDuration().toMillis()));

        return timeLimiter;
    }

    @Bean
    public TimeLimiter emailTimeLimiter() {
        TimeLimiterConfig config = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(15))
                .cancelRunningFuture(true)
                .build();

        return TimeLimiter.of("email", config);
    }
} 
package com.luanvan.luanvanbackend.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.util.Arrays;

@Aspect
// @Component - Tạm thời disable để debug
@Slf4j
public class LoggingAspect {

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerPointcut() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void servicePointcut() {}

    @Pointcut("execution(* com.luanvan.luanvanbackend.controllers..*(..))")
    public void controllerMethods() {}

    @Pointcut("execution(* com.luanvan.luanvanbackend.services..*(..))")
    public void serviceMethods() {}

    @Before("controllerMethods()")
    public void logBeforeController(JoinPoint joinPoint) {
        log.info("==> Controller: {}.{}() with arguments: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfterController(JoinPoint joinPoint, Object result) {
        log.info("<== Controller: {}.{}() returned: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                result != null ? result.getClass().getSimpleName() : "null");
    }

    @AfterThrowing(pointcut = "controllerMethods()", throwing = "exception")
    public void logExceptionController(JoinPoint joinPoint, Throwable exception) {
        log.error("!!! Controller Exception in {}.{}() with cause: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                exception.getMessage());
    }

    @Around("serviceMethods()")
    public Object logAroundService(ProceedingJoinPoint joinPoint) throws Throwable {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        log.debug("==> Service: {}.{}() started",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName());

        try {
            Object result = joinPoint.proceed();
            stopWatch.stop();
            
            log.debug("<== Service: {}.{}() completed in {} ms",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(),
                    stopWatch.getTotalTimeMillis());
            
            return result;
        } catch (Exception e) {
            stopWatch.stop();
            log.error("!!! Service Exception in {}.{}() after {} ms: {}",
                    joinPoint.getSignature().getDeclaringTypeName(),
                    joinPoint.getSignature().getName(),
                    stopWatch.getTotalTimeMillis(),
                    e.getMessage());
            throw e;
        }
    }

    @Before("execution(* com.luanvan.luanvanbackend.repositories..*.save*(..)) || " +
            "execution(* com.luanvan.luanvanbackend.repositories..*.delete*(..)) || " +
            "execution(* com.luanvan.luanvanbackend.repositories..*.update*(..))")
    public void logDatabaseModification(JoinPoint joinPoint) {
        log.info("Database modification: {}.{}() with arguments: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @Before("execution(* com.luanvan.luanvanbackend.services.impl.PaymentServiceImpl.*(..))")
    public void logPaymentOperation(JoinPoint joinPoint) {
        log.info("PAYMENT OPERATION: {}.{}() with arguments: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                Arrays.toString(joinPoint.getArgs()));
    }

    @Before("execution(* com.luanvan.luanvanbackend.security..*(..))")
    public void logSecurityOperation(JoinPoint joinPoint) {
        log.debug("SECURITY: {}.{}()",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName());
    }
} 
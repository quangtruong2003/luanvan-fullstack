package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Payment;
import com.luanvan.luanvanbackend.repositories.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSchedulerService {

    private final PaymentRepository paymentRepository;

    /**
     * Chạy mỗi 5 phút để kiểm tra payment hết hạn
     */
    @Scheduled(fixedDelay = 300000) // 5 phút
    @Transactional(rollbackFor = Exception.class)
    public void processExpiredPayments() {
        try {
            LocalDateTime currentTime = LocalDateTime.now();
            List<Payment> expiredPayments = paymentRepository.findExpiredPayments(currentTime);
            
            if (!expiredPayments.isEmpty()) {
                log.info("Found {} expired payments to process", expiredPayments.size());
                
                for (Payment payment : expiredPayments) {
                    log.info("Marking payment {} as expired", payment.getOrderId());
                    payment.setStatus(Payment.PaymentStatus.EXPIRED);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                }
                
                log.info("Processed {} expired payments", expiredPayments.size());
            } else {
                log.debug("No expired payments found");
            }
        } catch (Exception e) {
            log.error("Error processing expired payments: ", e);
            throw e; // Rethrow để trigger rollback
        }
    }

    /**
     * Chạy mỗi 30 phút để xử lý retry payment failed
     */
    @Scheduled(fixedDelay = 1800000) // 30 phút  
    @Transactional(rollbackFor = Exception.class)
    public void processFailedPaymentsRetry() {
        try {
            // Chỉ retry trong vòng 24 giờ
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
            int maxRetry = 3;
            
            List<Payment> failedPayments = paymentRepository.findPaymentsNeedRetry(maxRetry, cutoffTime);
            
            if (!failedPayments.isEmpty()) {
                log.info("Found {} failed payments that need retry", failedPayments.size());
                
                for (Payment payment : failedPayments) {
                    log.info("Incrementing retry count for payment {}", payment.getOrderId());
                    payment.setRetryCount(payment.getRetryCount() + 1);
                    payment.setUpdatedAt(LocalDateTime.now());
                    
                    // Nếu đã retry quá số lần cho phép, mark as CANCELLED
                    if (payment.getRetryCount() >= maxRetry) {
                        payment.setStatus(Payment.PaymentStatus.CANCELLED);
                        log.info("Payment {} cancelled after {} retry attempts", 
                                payment.getOrderId(), payment.getRetryCount());
                    }
                    
                    paymentRepository.save(payment);
                }
            } else {
                log.debug("No failed payments found that need retry");
            }
        } catch (Exception e) {
            log.error("Error processing failed payments retry: ", e);
            throw e; // Rethrow để trigger rollback
        }
    }

    /**
     * Chạy mỗi ngày lúc 2:00 AM để thống kê payment
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void generatePaymentStatistics() {
        try {
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(1);
            
            List<Object[]> statsProvider = paymentRepository.getPaymentStatsByProvider(startDate, endDate);
            List<Object[]> statsStatus = paymentRepository.getPaymentCountByStatus(startDate, endDate);
            
            log.info("=== Payment Statistics for {} ===", startDate.toLocalDate());
            log.info("By Provider:");
            for (Object[] stat : statsProvider) {
                log.info("  {}: {} VND", stat[0], stat[1]);
            }
            
            log.info("By Status:");
            for (Object[] stat : statsStatus) {
                log.info("  {}: {} transactions", stat[0], stat[1]);
            }
            
        } catch (Exception e) {
            log.error("Error generating payment statistics: ", e);
        }
    }
} 
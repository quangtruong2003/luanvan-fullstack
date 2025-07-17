package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Tìm payment theo order ID
     */
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.appointment a LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.clinic LEFT JOIN FETCH a.specialty WHERE p.orderId = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") String orderId);
    
    /**
     * Tìm payment theo gateway order ID
     */
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    
    /**
     * Tìm payment theo gateway transaction ID
     */
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    /**
     * Tìm payment theo appointment ID
     */
    List<Payment> findByAppointmentAppointmentId(Long appointmentId);
    
    /**
     * Tìm payment theo appointment ID và trạng thái
     */
    List<Payment> findByAppointmentAppointmentIdAndStatus(Long appointmentId, Payment.PaymentStatus status);
    
    /**
     * Tìm payment theo provider
     */
    Page<Payment> findByProvider(Payment.PaymentProvider provider, Pageable pageable);
    
    /**
     * Tìm payment theo trạng thái
     */
    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);
    
    /**
     * Tìm payment theo provider và trạng thái
     */
    Page<Payment> findByProviderAndStatus(Payment.PaymentProvider provider, Payment.PaymentStatus status, Pageable pageable);
    
    /**
     * Tìm payment theo khoảng thời gian tạo
     */
    Page<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * Tìm payment đã hết hạn nhưng chưa được cập nhật trạng thái
     */
    @Query("SELECT p FROM Payment p WHERE p.expiredAt < :currentTime AND p.status IN ('PENDING', 'PROCESSING')")
    List<Payment> findExpiredPayments(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Tìm payment cần retry (thất bại và số lần retry chưa quá ngưỡng)
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'FAILED' AND p.retryCount < :maxRetry AND p.createdAt > :cutoffTime")
    List<Payment> findPaymentsNeedRetry(@Param("maxRetry") Integer maxRetry, @Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Thống kê tổng số tiền theo provider
     */
    @Query("SELECT p.provider, SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND p.createdAt BETWEEN :startDate AND :endDate GROUP BY p.provider")
    List<Object[]> getPaymentStatsByProvider(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Thống kê số lượng giao dịch theo trạng thái
     */
    @Query("SELECT p.status, COUNT(p) FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate GROUP BY p.status")
    List<Object[]> getPaymentCountByStatus(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Kiểm tra xem appointment đã có payment thành công chưa
     */
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.appointment.appointmentId = :appointmentId AND p.status = 'SUCCESS'")
    boolean hasSuccessfulPayment(@Param("appointmentId") Long appointmentId);
    
    /**
     * Tìm payment gần đây nhất của appointment
     */
    @Query("SELECT p FROM Payment p WHERE p.appointment.appointmentId = :appointmentId ORDER BY p.createdAt DESC")
    List<Payment> findLatestPaymentByAppointment(@Param("appointmentId") Long appointmentId, Pageable pageable);

    List<Payment> findAllByStatusAndCreatedAtBefore(Payment.PaymentStatus status, LocalDateTime createdAt);
} 
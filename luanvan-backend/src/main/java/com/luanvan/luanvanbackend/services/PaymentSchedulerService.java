package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.entities.Payment;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.AvailabilitySlotRepository;
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
    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    private static final int PAYMENT_TIMEOUT_MINUTES = 15;

    /**
     * Chạy mỗi phút để kiểm tra và hủy các thanh toán/lịch hẹn quá hạn.
     * fixedRate = 60000 ms = 1 phút
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPendingPayments() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(PAYMENT_TIMEOUT_MINUTES);
        log.info("Running scheduled task to cancel expired payments created before: {}", expirationTime);

        List<Payment> expiredPayments = paymentRepository.findAllByStatusAndCreatedAtBefore(
                Payment.PaymentStatus.PENDING,
                expirationTime
        );

        if (expiredPayments.isEmpty()) {
            log.info("No expired pending payments found.");
            return;
        }

        log.info("Found {} expired payments to cancel.", expiredPayments.size());

        for (Payment payment : expiredPayments) {
            try {
                Appointment appointment = payment.getAppointment();
                if (appointment != null && appointment.getStatus() == Appointment.AppointmentStatus.PENDING_PAYMENT) {

                    // 1. Cập nhật trạng thái Payment
                    payment.setStatus(Payment.PaymentStatus.EXPIRED);
                    paymentRepository.save(payment);
                    log.info("Payment ID {} has been marked as EXPIRED.", payment.getPaymentId());

                    // 2. Hủy Lịch hẹn
                    appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_CLINIC);
                    appointment.setCancellationReason("Thanh toán quá hạn.");
                    appointmentRepository.save(appointment);
                    log.info("Appointment ID {} has been CANCELLED due to payment expiration.", appointment.getAppointmentId());

                    // 3. Trả lại Slot
                    AvailabilitySlot slot = appointment.getSlot();
                    if (slot != null) {
                        slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
                        availabilitySlotRepository.save(slot);
                        log.info("AvailabilitySlot ID {} has been returned to AVAILABLE.", slot.getSlotId());
                    }
                }
            } catch (Exception e) {
                log.error("Error processing expired payment ID {}: {}", payment.getPaymentId(), e.getMessage(), e);
            }
        }
        log.info("Finished processing expired payments.");
    }
} 
package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
import com.luanvan.luanvanbackend.repositories.AvailabilitySlotRepository;
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

    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    private static final int PAYMENT_TIMEOUT_MINUTES = 15;

    /**
     * Tác vụ này chạy mỗi 5 phút để dọn dẹp các lịch hẹn đã quá hạn chờ thanh toán.
     * Nó quét trực tiếp các lịch hẹn có trạng thái PENDING_PAYMENT đã được tạo
     * quá 15 phút để đảm bảo không có lịch hẹn nào bị "mắc kẹt" do lỗi
     * trong quá trình tạo thanh toán.
     * fixedRate = 300000 ms = 5 phút.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanupExpiredPendingAppointments() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(PAYMENT_TIMEOUT_MINUTES);
        log.info("Scheduler: Running cleanup for appointments in PENDING_PAYMENT created before: {}", expirationTime);

        List<Appointment> expiredAppointments = appointmentRepository.findByStatusAndBookingTimestampBefore(
                Appointment.AppointmentStatus.PENDING_PAYMENT,
                expirationTime
        );

        if (expiredAppointments.isEmpty()) {
            log.info("Scheduler: No expired PENDING_PAYMENT appointments found.");
            return;
        }

        log.warn("Scheduler: Found {} expired PENDING_PAYMENT appointments to cancel. This may indicate issues in the payment flow.", expiredAppointments.size());

        for (Appointment appointment : expiredAppointments) {
            try {
                // 1. Hủy Lịch hẹn
                appointment.setStatus(Appointment.AppointmentStatus.CANCELLED_BY_CLINIC);
                appointment.setCancellationReason("Thanh toán quá hạn (tự động hủy bởi hệ thống).");
                appointment.setCancellationTimestamp(LocalDateTime.now());
                appointmentRepository.save(appointment);
                log.info("Scheduler: Cancelled Appointment ID {} due to payment timeout.", appointment.getAppointmentId());

                // 2. Trả lại Slot
                AvailabilitySlot slot = appointment.getSlot();
                if (slot != null) {
                    // Chỉ trả lại slot nếu nó đang ở trạng thái BOOKED
                    if (slot.getStatus() == AvailabilitySlot.SlotStatus.BOOKED) {
                        slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
                        availabilitySlotRepository.save(slot);
                        log.info("Scheduler: AvailabilitySlot ID {} has been returned to AVAILABLE.", slot.getSlotId());
                    } else {
                        log.warn("Scheduler: Slot ID {} for cancelled appointment {} was not in BOOKED status (was {}). No action taken.", 
                                 slot.getSlotId(), appointment.getAppointmentId(), slot.getStatus());
                    }
                } else {
                    log.error("Scheduler: Critical - Appointment ID {} has no associated slot to release.", appointment.getAppointmentId());
                }

            } catch (Exception e) {
                log.error("Scheduler: Error cancelling expired appointment ID {}: {}", appointment.getAppointmentId(), e.getMessage(), e);
            }
        }
        log.info("Scheduler: Finished cleaning up expired PENDING_PAYMENT appointments.");
    }
}
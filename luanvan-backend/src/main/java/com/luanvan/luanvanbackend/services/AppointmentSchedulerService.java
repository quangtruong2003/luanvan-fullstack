package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.entities.Appointment;
import com.luanvan.luanvanbackend.repositories.AppointmentRepository;
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
public class AppointmentSchedulerService {

    private final AppointmentRepository appointmentRepository;

    private static final int NO_SHOW_TIMEOUT_HOURS = 24;

    /**
     * Tác vụ này chạy mỗi 5 phút để kiểm tra và cập nhật các lịch hẹn đã qua
     * nhưng chưa được bác sĩ/phòng khám xử lý.
     * Nó sẽ chuyển các lịch hẹn có trạng thái CONFIRMED đã quá 24 giờ so với
     * thời gian hẹn thành NO_SHOW (không đến).
     * fixedRate = 300000 ms = 5 phút.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void updatePastAppointmentsToNoShow() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(NO_SHOW_TIMEOUT_HOURS);
        log.info("Scheduler: Finding CONFIRMED appointments with appointmentDateTime before {}", cutoffTime);

        List<Appointment> pastConfirmedAppointments = appointmentRepository
                .findByStatusAndAppointmentDateTimeBefore(Appointment.AppointmentStatus.CONFIRMED, cutoffTime);

        if (pastConfirmedAppointments.isEmpty()) {
            log.info("Scheduler: No past-due CONFIRMED appointments found to update to NO_SHOW.");
            return;
        }

        log.warn("Scheduler: Found {} CONFIRMED appointments to mark as NO_SHOW.", pastConfirmedAppointments.size());

        for (Appointment appointment : pastConfirmedAppointments) {
            try {
                // Chuyển trạng thái sang NO_SHOW
                appointment.setStatus(Appointment.AppointmentStatus.NO_SHOW);
                appointment.setCancellationReason("Bệnh nhân không đến (tự động cập nhật bởi hệ thống).");
                appointment.setCancellationTimestamp(LocalDateTime.now());
                appointmentRepository.save(appointment);

                // Ghi chú: Slot vẫn giữ trạng thái BOOKED theo yêu cầu nghiệp vụ,
                // vì bệnh nhân đã không đến và slot này không thể được sử dụng lại.
                log.info("Scheduler: Updated appointment ID {} to NO_SHOW. The associated slot remains BOOKED.", appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("Scheduler: Error updating appointment ID {} to NO_SHOW: {}",
                        appointment.getAppointmentId(), e.getMessage(), e);
            }
        }
        log.info("Scheduler: Finished updating past-due CONFIRMED appointments to NO_SHOW.");
    }
}

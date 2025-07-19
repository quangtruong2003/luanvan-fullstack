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
public class AppointmentSchedulerService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    /**
     * Tác vụ này chạy hàng giờ để kiểm tra các lịch hẹn đã qua nhưng chưa được cập nhật.
     * Nó sẽ chuyển các lịch hẹn CONFIRMED đã qua thành NO_SHOW.
     * cron = "0 0 * * * *" = Chạy vào đầu mỗi giờ.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updatePastAppointmentsToNoShow() {
        // Tìm các lịch hẹn CONFIRMED đã qua 1 ngày (24 giờ)
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        log.info("Scheduler: Finding CONFIRMED appointments older than {}", twentyFourHoursAgo);

        List<Appointment> pastConfirmedAppointments = appointmentRepository
                .findByStatusAndAppointmentDateTimeBefore(Appointment.AppointmentStatus.CONFIRMED, twentyFourHoursAgo);

        if (pastConfirmedAppointments.isEmpty()) {
            log.info("Scheduler: No past-due CONFIRMED appointments found to update.");
            return;
        }

        log.info("Scheduler: Found {} appointments to mark as NO_SHOW.", pastConfirmedAppointments.size());

        for (Appointment appointment : pastConfirmedAppointments) {
            try {
                // Chuyển trạng thái sang NO_SHOW
                appointment.setStatus(Appointment.AppointmentStatus.NO_SHOW);
                appointmentRepository.save(appointment);

                // Slot vẫn giữ trạng thái BOOKED vì bệnh nhân đã không đến,
                // không thể trả lại slot cho người khác đặt.

                log.info("Scheduler: Updated appointment ID {} to NO_SHOW.", appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("Scheduler: Error updating appointment ID {} to NO_SHOW: {}",
                        appointment.getAppointmentId(), e.getMessage(), e);
            }
        }
        log.info("Scheduler: Finished updating past-due appointments.");
    }
} 
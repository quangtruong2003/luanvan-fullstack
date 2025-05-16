package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByDoctorDoctorId(Long doctorId);
    
    List<AvailabilitySlot> findByDoctorDoctorIdAndDate(Long doctorId, LocalDate date);
    
    List<AvailabilitySlot> findByDoctorDoctorIdAndDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);
    
    List<AvailabilitySlot> findByDateAndStatus(LocalDate date, AvailabilitySlot.SlotStatus status);
    
    List<AvailabilitySlot> findByDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, AvailabilitySlot.SlotStatus status);
    
    List<AvailabilitySlot> findByClinicClinicId(Long clinicId);
    
    @Query("SELECT a FROM AvailabilitySlot a " +
           "WHERE a.doctor.doctorId = :doctorId AND a.date = :date " +
           "AND ((a.startTime <= :endTime AND a.endTime >= :startTime))")
    List<AvailabilitySlot> findOverlappingSlots(@Param("doctorId") Long doctorId, 
                                               @Param("date") LocalDate date,
                                               @Param("startTime") LocalTime startTime,
                                               @Param("endTime") LocalTime endTime);
    
    @Query("SELECT a FROM AvailabilitySlot a " +
           "JOIN a.doctor d JOIN d.specialties ds " +
           "WHERE ds.specialty.specialtyId = :specialtyId AND a.date = :date AND a.status = 'AVAILABLE'")
    List<AvailabilitySlot> findAvailableSlotsBySpecialtyAndDate(@Param("specialtyId") Long specialtyId, 
                                                               @Param("date") LocalDate date);
} 
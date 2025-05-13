package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.StandardWorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface StandardWorkShiftRepository extends JpaRepository<StandardWorkShift, Long> {
    List<StandardWorkShift> findByDayOfWeek(DayOfWeek dayOfWeek);
    
    List<StandardWorkShift> findByClinicClinicId(Long clinicId);
    
    List<StandardWorkShift> findByClinicClinicIdAndDayOfWeek(Long clinicId, DayOfWeek dayOfWeek);
    
    List<StandardWorkShift> findByIsDefaultTrue();
} 
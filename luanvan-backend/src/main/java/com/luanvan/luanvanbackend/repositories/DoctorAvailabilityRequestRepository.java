package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.DoctorAvailabilityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorAvailabilityRequestRepository extends JpaRepository<DoctorAvailabilityRequest, Long> {
    List<DoctorAvailabilityRequest> findByDoctorDoctorId(Long doctorId);
    
    Page<DoctorAvailabilityRequest> findByDoctorDoctorId(Long doctorId, Pageable pageable);
    
    List<DoctorAvailabilityRequest> findByDoctorDoctorIdAndStatus(Long doctorId, DoctorAvailabilityRequest.RequestStatus status);
    
    List<DoctorAvailabilityRequest> findByWeekStartDateBetween(LocalDate start, LocalDate end);
    
    List<DoctorAvailabilityRequest> findByStatus(DoctorAvailabilityRequest.RequestStatus status);
    
    List<DoctorAvailabilityRequest> findByReviewerUserId(Long reviewerId);
} 
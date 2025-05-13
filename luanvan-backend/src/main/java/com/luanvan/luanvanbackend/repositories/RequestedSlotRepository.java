package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.RequestedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RequestedSlotRepository extends JpaRepository<RequestedSlot, Long> {
    List<RequestedSlot> findByRequestRequestId(Long requestId);
    
    List<RequestedSlot> findByDate(LocalDate date);
    
    List<RequestedSlot> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    void deleteByRequestRequestId(Long requestId);
} 
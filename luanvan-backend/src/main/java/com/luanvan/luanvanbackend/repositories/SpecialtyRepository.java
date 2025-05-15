package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    List<Specialty> findByNameContainingIgnoreCase(String name);
    
    Page<Specialty> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    List<Specialty> findByClinicClinicId(Long clinicId);
    
    Page<Specialty> findByClinicClinicId(Long clinicId, Pageable pageable);
} 
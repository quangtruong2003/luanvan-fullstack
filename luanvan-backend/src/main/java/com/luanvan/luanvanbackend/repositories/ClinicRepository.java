package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Clinic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {
    List<Clinic> findByNameContainingIgnoreCase(String name);
    
    Page<Clinic> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Clinic findByPhoneNumber(String phoneNumber);
    
    Clinic findByEmail(String email);
} 
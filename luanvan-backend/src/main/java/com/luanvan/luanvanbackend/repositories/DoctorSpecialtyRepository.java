package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.DoctorSpecialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorSpecialtyRepository extends JpaRepository<DoctorSpecialty, Long> {
    List<DoctorSpecialty> findByDoctorDoctorId(Long doctorId);
    
    List<DoctorSpecialty> findBySpecialtySpecialtyId(Long specialtyId);
    
    DoctorSpecialty findByDoctorDoctorIdAndSpecialtySpecialtyId(Long doctorId, Long specialtyId);
    
    void deleteByDoctorDoctorIdAndSpecialtySpecialtyId(Long doctorId, Long specialtyId);
    
    long countBySpecialtySpecialtyId(Long specialtyId);
    
    List<DoctorSpecialty> findByIsPrimaryTrue();
    
    List<DoctorSpecialty> findByDoctorDoctorIdAndIsPrimaryTrue(Long doctorId);
} 
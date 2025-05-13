package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    // Tìm bác sĩ theo tên (tìm kiếm không phân biệt chữ hoa/thường)
    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Doctor> findByUserFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    // Tìm bác sĩ theo chuyên khoa
    @Query("SELECT d FROM Doctor d JOIN d.specialties ds WHERE ds.specialty.specialtyId = :specialtyId")
    Page<Doctor> findBySpecialtyId(@Param("specialtyId") Long specialtyId, Pageable pageable);
    
    // Tìm bác sĩ theo số năm kinh nghiệm tối thiểu
    List<Doctor> findByYearsOfExperienceGreaterThanEqual(Integer yearsOfExperience);
} 
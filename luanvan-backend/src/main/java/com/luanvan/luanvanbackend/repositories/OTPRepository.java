package com.luanvan.luanvanbackend.repositories;

import com.luanvan.luanvanbackend.entities.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findBySessionId(String sessionId);
    Optional<OTP> findByPhoneNumberAndSessionId(String phoneNumber, String sessionId);
} 
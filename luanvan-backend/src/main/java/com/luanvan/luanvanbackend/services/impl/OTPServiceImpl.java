package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.entities.OTP;
import com.luanvan.luanvanbackend.repositories.OTPRepository;
import com.luanvan.luanvanbackend.services.OTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements OTPService {
    
    private final OTPRepository otpRepository;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    
    @Override
    public String generateOTP() {
        // Sinh 6 chữ số ngẫu nhiên
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }
    
    @Override
    public void saveOTP(String phoneNumber, String otp, String sessionId) {
        // Tính thời điểm hết hạn (mặc định 5 phút)
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
        
        // Kiểm tra xem đã có OTP với sessionId này chưa
        Optional<OTP> existingOTP = otpRepository.findBySessionId(sessionId);
        
        if (existingOTP.isPresent()) {
            // Cập nhật OTP hiện có
            OTP otpEntity = existingOTP.get();
            otpEntity.setOtpValue(otp);
            otpEntity.setExpiryTime(expiryTime);
            otpEntity.setVerified(false);
            otpRepository.save(otpEntity);
        } else {
            // Tạo mới OTP
            OTP otpEntity = OTP.builder()
                    .phoneNumber(phoneNumber)
                    .otpValue(otp)
                    .sessionId(sessionId)
                    .expiryTime(expiryTime)
                    .isVerified(false)
                    .build();
            
            otpRepository.save(otpEntity);
        }
    }
    
    @Override
    public boolean verifyOTP(String sessionId, String otp) {
        Optional<OTP> otpOptional = otpRepository.findBySessionId(sessionId);
        
        if (otpOptional.isPresent()) {
            OTP otpEntity = otpOptional.get();
            
            // Kiểm tra OTP có khớp và còn hiệu lực
            if (otpEntity.getOtpValue().equals(otp) && 
                    LocalDateTime.now().isBefore(otpEntity.getExpiryTime()) &&
                    !otpEntity.isVerified()) {
                
                // Cập nhật trạng thái đã xác thực
                otpEntity.setVerified(true);
                otpRepository.save(otpEntity);
                
                return true;
            }
        }
        
        return false;
    }
    
    @Override
    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }
} 
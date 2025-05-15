package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import com.luanvan.luanvanbackend.repositories.SystemConfigurationRepository;
import com.luanvan.luanvanbackend.services.SystemConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SystemConfigurationServiceImpl implements SystemConfigurationService {

    @Autowired
    private SystemConfigurationRepository configRepository;

    @Override
    public SystemConfiguration getCurrentConfiguration() {
        // Luôn lấy bản ghi đầu tiên, vì chỉ có một cấu hình toàn cục
        SystemConfiguration config = configRepository.findFirstByOrderByConfigIdAsc();
        
        if (config == null) {
            // Nếu chưa có cấu hình, tạo mới với giá trị mặc định
            return createDefaultConfiguration();
        }
        
        return config;
    }

    @Override
    @Transactional
    public SystemConfiguration updateConfiguration(SystemConfigurationDTO configDTO) {
        SystemConfiguration config = getCurrentConfiguration();
        
        // Cập nhật thông tin từ DTO
        if (configDTO.getEnableDeposit() != null) {
            config.setEnableDeposit(configDTO.getEnableDeposit());
        }
        
        if (configDTO.getDefaultDepositAmount() != null) {
            config.setDefaultDepositAmount(configDTO.getDefaultDepositAmount());
        }
        
        if (configDTO.getMomoPartnerCode() != null) {
            config.setMomoPartnerCode(configDTO.getMomoPartnerCode());
        }
        
        if (configDTO.getMomoAccessKey() != null) {
            config.setMomoAccessKey(configDTO.getMomoAccessKey());
        }
        
        if (configDTO.getMomoSecretKey() != null) {
            config.setMomoSecretKey(configDTO.getMomoSecretKey());
        }
        
        if (configDTO.getMomoApiEndpoint() != null) {
            config.setMomoApiEndpoint(configDTO.getMomoApiEndpoint());
        }
        
        if (configDTO.getPaymentRetryTimeoutMinutes() != null) {
            config.setPaymentRetryTimeoutMinutes(configDTO.getPaymentRetryTimeoutMinutes());
        }
        
        if (configDTO.getPatientCancellationTimeLimitHours() != null) {
            config.setPatientCancellationTimeLimitHours(configDTO.getPatientCancellationTimeLimitHours());
        }
        
        if (configDTO.getNonRefundableDepositPolicyText() != null) {
            config.setNonRefundableDepositPolicyText(configDTO.getNonRefundableDepositPolicyText());
        }
        
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration toggleDepositFeature(boolean enableDeposit) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setEnableDeposit(enableDeposit);
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updateDefaultDepositAmount(double amount) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setDefaultDepositAmount(BigDecimal.valueOf(amount));
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updateMomoConfiguration(
            String partnerCode, String accessKey, String secretKey, String apiEndpoint) {
        SystemConfiguration config = getCurrentConfiguration();
        
        if (partnerCode != null) {
            config.setMomoPartnerCode(partnerCode);
        }
        
        if (accessKey != null) {
            config.setMomoAccessKey(accessKey);
        }
        
        if (secretKey != null) {
            config.setMomoSecretKey(secretKey);
        }
        
        if (apiEndpoint != null) {
            config.setMomoApiEndpoint(apiEndpoint);
        }
        
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updatePaymentRetryTimeout(int minutes) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setPaymentRetryTimeoutMinutes(minutes);
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updatePatientCancellationTimeLimit(int hours) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setPatientCancellationTimeLimitHours(hours);
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updateNonRefundableDepositPolicy(String policyText) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setNonRefundableDepositPolicyText(policyText);
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration createDefaultConfiguration() {
        // Kiểm tra xem đã có cấu hình chưa
        if (configRepository.findFirstByOrderByConfigIdAsc() != null) {
            return configRepository.findFirstByOrderByConfigIdAsc();
        }
        
        // Tạo cấu hình mặc định
        SystemConfiguration config = new SystemConfiguration();
        config.setEnableDeposit(true);
        config.setDefaultDepositAmount(new BigDecimal("50000")); // 50,000 VND
        config.setMomoPartnerCode("");
        config.setMomoAccessKey("");
        config.setMomoSecretKey("");
        config.setMomoApiEndpoint("https://test-payment.momo.vn/v2/gateway/api/create");
        config.setPaymentRetryTimeoutMinutes(15);
        config.setPatientCancellationTimeLimitHours(24);
        config.setNonRefundableDepositPolicyText(
                "Nếu bệnh nhân hủy lịch hẹn ít hơn 24 giờ trước thời gian hẹn, tiền đặt cọc sẽ không được hoàn lại.");
        
        return configRepository.save(config);
    }
} 
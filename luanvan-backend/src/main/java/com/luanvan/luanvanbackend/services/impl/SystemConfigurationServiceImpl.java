package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import com.luanvan.luanvanbackend.exception.ResourceNotFoundException;
import com.luanvan.luanvanbackend.repositories.SystemConfigurationRepository;
import com.luanvan.luanvanbackend.services.SystemConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemConfigurationServiceImpl implements SystemConfigurationService {

    // Explicit logger declaration for Docker compatibility
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SystemConfigurationServiceImpl.class);

    private final SystemConfigurationRepository configRepository;

    @Override
    public SystemConfiguration getSystemConfig() {
        // Luôn trả về cấu hình đầu tiên hoặc tạo mới nếu không có
        return configRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    log.warn("No system configuration found, creating a default one.");
                    return createDefaultConfiguration();
                });
    }

    @Override
    @Transactional
    public SystemConfiguration updateSystemConfig(SystemConfigurationDTO configDTO) {
        try {
            log.info("🔄 Updating system configuration with DTO: {}", configDTO);
            SystemConfiguration config = getCurrentConfiguration();
            
            // General
            Optional.ofNullable(configDTO.getEnableDeposit()).ifPresent(config::setEnableDeposit);
            Optional.ofNullable(configDTO.getDefaultDepositAmount()).ifPresent(config::setDefaultDepositAmount);
            Optional.ofNullable(configDTO.getDefaultPaymentMethod()).ifPresent(config::setDefaultPaymentMethod);
            Optional.ofNullable(configDTO.getExaminationFee()).ifPresent(config::setExaminationFee);
            Optional.ofNullable(configDTO.getPaymentRetryTimeoutMinutes()).ifPresent(config::setPaymentRetryTimeoutMinutes);
            Optional.ofNullable(configDTO.getPatientCancellationTimeLimitHours()).ifPresent(config::setPatientCancellationTimeLimitHours);
            Optional.ofNullable(configDTO.getNonRefundableDepositPolicy()).ifPresent(config::setNonRefundableDepositPolicy);

            // Momo
            Optional.ofNullable(configDTO.getEnableMomo()).ifPresent(config::setEnableMomo);
            Optional.ofNullable(configDTO.getMomoPartnerCode()).ifPresent(config::setMomoPartnerCode);
            Optional.ofNullable(configDTO.getMomoAccessKey()).ifPresent(config::setMomoAccessKey);
            Optional.ofNullable(configDTO.getMomoSecretKey()).ifPresent(config::setMomoSecretKey);
            Optional.ofNullable(configDTO.getMomoApiEndpoint()).ifPresent(config::setMomoApiEndpoint);

            // VNPay
            Optional.ofNullable(configDTO.getEnableVnPay()).ifPresent(config::setEnableVnPay);
            Optional.ofNullable(configDTO.getVnpayTmnCode()).ifPresent(config::setVnpayTmnCode);
            Optional.ofNullable(configDTO.getVnpaySecretKey()).ifPresent(config::setVnpaySecretKey);
            
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ System configuration updated successfully.");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating system configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update system configuration", e);
        }
    }

    @Override
    public SystemConfiguration getCurrentConfiguration() {
        return configRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("System configuration not found."));
    }

    @Override
    @Transactional
    public SystemConfiguration updateMomoConfiguration(String partnerCode, String accessKey, String secretKey, String apiEndpoint) {
       try {
            log.info("🔄 Updating Momo configuration...");
            SystemConfiguration config = getCurrentConfiguration();
            
            Optional.ofNullable(partnerCode).ifPresent(config::setMomoPartnerCode);
            Optional.ofNullable(accessKey).ifPresent(config::setMomoAccessKey);
            Optional.ofNullable(secretKey).ifPresent(config::setMomoSecretKey);
            Optional.ofNullable(apiEndpoint).ifPresent(config::setMomoApiEndpoint);
            
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Momo configuration updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating Momo configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update Momo configuration", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration toggleMomoPayment(boolean enableMomo) {
        try {
            log.info("🔄 Toggling Momo payment to: {}", enableMomo);
            SystemConfiguration config = getCurrentConfiguration();
            config.setEnableMomo(enableMomo);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Momo payment toggled successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error toggling Momo payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to toggle Momo payment", e);
        }
    }
    
    @Override
    @Transactional
    public SystemConfiguration toggleVNPayPayment(boolean enableVnPay) {
        try {
            log.info("🔄 Toggling VNPay payment to: {}", enableVnPay);
            SystemConfiguration config = getCurrentConfiguration();
            config.setEnableVnPay(enableVnPay);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ VNPay payment toggled successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error toggling VNPay payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to toggle VNPay payment", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration toggleDepositFeature(boolean enableDeposit) {
        try {
            log.info("🔄 Toggling deposit feature to: {}", enableDeposit);
            SystemConfiguration config = getCurrentConfiguration();
            config.setEnableDeposit(enableDeposit);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Deposit feature toggled successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error toggling deposit feature: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to toggle deposit feature", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updateDefaultDepositAmount(double amount) {
        try {
            log.info("🔄 Updating default deposit amount to: {}", amount);
            SystemConfiguration config = getCurrentConfiguration();
            config.setDefaultDepositAmount(BigDecimal.valueOf(amount));
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Default deposit amount updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating default deposit amount: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update default deposit amount", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updateDefaultPaymentMethod(String defaultPaymentMethod) {
        try {
            log.info("🔄 Updating default payment method to: {}", defaultPaymentMethod);
            SystemConfiguration config = getCurrentConfiguration();
            config.setDefaultPaymentMethod(defaultPaymentMethod);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Default payment method updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating default payment method: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update default payment method", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration createDefaultConfiguration() {
        log.info("✨ Creating default system configuration...");
        if (configRepository.count() > 0) {
            log.warn("Default configuration already exists, skipping creation.");
            return configRepository.findAll().get(0);
        }
        
        SystemConfiguration config = new SystemConfiguration();
        
        // General Default
        config.setEnableDeposit(true);
        config.setDefaultDepositAmount(new BigDecimal("50000"));
        config.setDefaultPaymentMethod("momo");
        
        // MoMo Default Configuration
        config.setEnableMomo(true);
        config.setMomoPartnerCode("");
        config.setMomoAccessKey("");
        config.setMomoSecretKey("");
        config.setMomoApiEndpoint("");
        
        // VNPay Default Configuration
        config.setEnableVnPay(true);
        config.setVnpayTmnCode("");
        config.setVnpaySecretKey("");

        // Other settings
        config.setExaminationFee(new BigDecimal("200000"));
        config.setPaymentRetryTimeoutMinutes(15);
        config.setPatientCancellationTimeLimitHours(24);
        config.setNonRefundableDepositPolicy("Phí đặt cọc sẽ không được hoàn lại nếu hủy lịch sau thời gian cho phép.");
        
        // Save and return
        SystemConfiguration savedConfig = configRepository.save(config);
        log.info("✅ Default system configuration created successfully with ID: {}", savedConfig.getConfigId());
        return savedConfig;
    }

    @Override
    @Transactional
    public SystemConfiguration updateVNPayConfiguration(String tmnCode, String secretKey) {
        try {
            log.info("🔄 Updating VNPay configuration...");
            SystemConfiguration config = getCurrentConfiguration();
            
            Optional.ofNullable(tmnCode).ifPresent(config::setVnpayTmnCode);
            Optional.ofNullable(secretKey).ifPresent(config::setVnpaySecretKey);
            
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ VNPay configuration updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating VNPay configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update VNPay configuration", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updatePaymentRetryTimeout(int minutes) {
        try {
            log.info("🔄 Updating payment retry timeout to: {} minutes", minutes);
            SystemConfiguration config = getCurrentConfiguration();
            config.setPaymentRetryTimeoutMinutes(minutes);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Payment retry timeout updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating payment retry timeout: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update payment retry timeout", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updatePatientCancellationTimeLimit(int hours) {
        try {
            log.info("🔄 Updating patient cancellation time limit to: {} hours", hours);
            SystemConfiguration config = getCurrentConfiguration();
            config.setPatientCancellationTimeLimitHours(hours);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Patient cancellation time limit updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating patient cancellation time limit: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update patient cancellation time limit", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updateNonRefundableDepositPolicy(String policyText) {
        try {
            log.info("🔄 Updating non-refundable deposit policy...");
            SystemConfiguration config = getCurrentConfiguration();
            config.setNonRefundableDepositPolicy(policyText);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Non-refundable deposit policy updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating non-refundable deposit policy: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update non-refundable deposit policy", e);
        }
    }
} 
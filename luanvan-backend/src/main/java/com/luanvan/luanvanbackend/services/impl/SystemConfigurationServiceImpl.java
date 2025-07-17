package com.luanvan.luanvanbackend.services.impl;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import com.luanvan.luanvanbackend.repositories.SystemConfigurationRepository;
import com.luanvan.luanvanbackend.services.SystemConfigurationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class SystemConfigurationServiceImpl implements SystemConfigurationService {

    private final SystemConfigurationRepository configRepository;

    public SystemConfigurationServiceImpl(SystemConfigurationRepository configRepository) {
        this.configRepository = configRepository;
    }

    @Override
    @Transactional
    public SystemConfiguration getCurrentConfiguration() {
        try {
            log.info("🔍 Fetching current system configuration...");
            SystemConfiguration config = configRepository.findFirstByOrderByConfigIdAsc();
            
            if (config == null) {
                log.warn("⚠️ No system configuration found. Creating default configuration...");
                config = createDefaultConfiguration();
                log.info("✅ Default configuration created successfully");
            } else {
                log.info("✅ System configuration found with ID: {}", config.getConfigId());
            }
            
            return config;
        } catch (Exception e) {
            log.error("❌ Error fetching system configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch system configuration", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updateConfiguration(SystemConfigurationDTO configDTO) {
        try {
            log.info("🔄 Updating system configuration...");
            SystemConfiguration config = getCurrentConfiguration();

            // Ghi đè toàn bộ cấu hình từ DTO
            config.setEnableDeposit(configDTO.getEnableDeposit());
            config.setDefaultDepositAmount(configDTO.getDefaultDepositAmount());
            
            // MoMo
            config.setEnableMomo(configDTO.getEnableMomo());
            config.setMomoPartnerCode(configDTO.getMomoPartnerCode());
            config.setMomoAccessKey(configDTO.getMomoAccessKey());
            config.setMomoSecretKey(configDTO.getMomoSecretKey());
            config.setMomoApiEndpoint(configDTO.getMomoApiEndpoint());

            // VNPay
            config.setEnableVNPay(configDTO.getEnableVNPay());
            config.setVnpayTmnCode(configDTO.getVnpayTmnCode());
            config.setVnpaySecretKey(configDTO.getVnpaySecretKey());

            // General Payment Settings
            config.setDefaultPaymentMethod(configDTO.getDefaultPaymentMethod());
            config.setPatientCancellationTimeLimitHours(configDTO.getPatientCancellationTimeLimitHours());
            config.setPaymentRetryTimeoutMinutes(configDTO.getPaymentRetryTimeoutMinutes());
            config.setNonRefundableDepositPolicyText(configDTO.getNonRefundableDepositPolicyText());

            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ System configuration updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating system configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update system configuration", e);
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
    public SystemConfiguration toggleMomoPayment(boolean enableMomo) {
        try {
            log.info("🔄 Toggling MoMo payment to: {}", enableMomo);
            SystemConfiguration config = getCurrentConfiguration();
            config.setEnableMomo(enableMomo);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ MoMo payment toggled successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error toggling MoMo payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to toggle MoMo payment", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration toggleVNPayPayment(boolean enableVNPay) {
        try {
            log.info("🔄 Toggling VNPay payment to: {}", enableVNPay);
            SystemConfiguration config = getCurrentConfiguration();
            config.setEnableVNPay(enableVNPay);
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
    public SystemConfiguration updateMomoConfiguration(
            String partnerCode, String accessKey, String secretKey, String apiEndpoint) {
        try {
            log.info("🔄 Updating MoMo configuration...");
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
            
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ MoMo configuration updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating MoMo configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update MoMo configuration", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration updateVNPayConfiguration(String tmnCode, String secretKey) {
        try {
            log.info("🔄 Updating VNPay configuration...");
            SystemConfiguration config = getCurrentConfiguration();
            
            if (tmnCode != null) {
                config.setVnpayTmnCode(tmnCode);
            }
            
            if (secretKey != null) {
                config.setVnpaySecretKey(secretKey);
            }
            
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
            config.setNonRefundableDepositPolicyText(policyText);
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Non-refundable deposit policy updated successfully");
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error updating non-refundable deposit policy: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update non-refundable deposit policy", e);
        }
    }

    @Override
    @Transactional
    public SystemConfiguration createDefaultConfiguration() {
        try {
            log.info("🔄 Creating default system configuration...");
            
            // Kiểm tra xem đã có cấu hình chưa
            SystemConfiguration existingConfig = configRepository.findFirstByOrderByConfigIdAsc();
            if (existingConfig != null) {
                log.info("✅ Configuration already exists, returning existing one");
                return existingConfig;
            }
            
            // Tạo cấu hình mặc định
            SystemConfiguration config = new SystemConfiguration();
            config.setEnableDeposit(true);
            config.setDefaultDepositAmount(new BigDecimal("50000")); // 50,000 VND
            
            // MoMo Default Configuration
            config.setEnableMomo(true);
            config.setMomoPartnerCode("");
            config.setMomoAccessKey("");
            config.setMomoSecretKey("");
            config.setMomoApiEndpoint("https://test-payment.momo.vn/v2/gateway/api/create");
            
            // VNPay Default Configuration
            config.setEnableVNPay(true);
            config.setVnpayTmnCode("");
            config.setVnpaySecretKey("");
            
            // Payment Settings
            config.setDefaultPaymentMethod("momo");
            config.setPaymentRetryTimeoutMinutes(15);
            config.setPatientCancellationTimeLimitHours(24);
            config.setNonRefundableDepositPolicyText(
                    "Nếu bệnh nhân hủy lịch hẹn ít hơn 24 giờ trước thời gian hẹn, tiền đặt cọc sẽ không được hoàn lại.");
            
            SystemConfiguration savedConfig = configRepository.save(config);
            log.info("✅ Default configuration created successfully with ID: {}", savedConfig.getConfigId());
            return savedConfig;
        } catch (Exception e) {
            log.error("❌ Error creating default configuration: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create default configuration", e);
        }
    }
} 
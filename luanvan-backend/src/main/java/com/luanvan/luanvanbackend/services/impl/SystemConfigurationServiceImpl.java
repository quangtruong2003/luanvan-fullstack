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

        // Ghi đè toàn bộ cấu hình từ DTO, không kiểm tra null
        // Điều này đảm bảo trạng thái từ frontend luôn là nguồn dữ liệu chính xác
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
    public SystemConfiguration toggleMomoPayment(boolean enableMomo) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setEnableMomo(enableMomo); // Sửa lỗi: Sử dụng đúng tham số 'enableMomo'
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration toggleVNPayPayment(boolean enableVNPay) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setEnableVNPay(enableVNPay); // Sửa lỗi: Sử dụng đúng tham số 'enableVNPay'
        return configRepository.save(config);
    }

    @Override
    @Transactional
    public SystemConfiguration updateDefaultPaymentMethod(String defaultPaymentMethod) {
        SystemConfiguration config = getCurrentConfiguration();
        config.setDefaultPaymentMethod(defaultPaymentMethod);
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
    public SystemConfiguration updateVNPayConfiguration(String tmnCode, String secretKey) {
        SystemConfiguration config = getCurrentConfiguration();
        
        if (tmnCode != null) {
            config.setVnpayTmnCode(tmnCode);
        }
        
        if (secretKey != null) {
            config.setVnpaySecretKey(secretKey);
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
        
        return configRepository.save(config);
    }
} 
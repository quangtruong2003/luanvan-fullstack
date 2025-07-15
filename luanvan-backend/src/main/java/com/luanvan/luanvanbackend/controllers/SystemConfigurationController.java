package com.luanvan.luanvanbackend.controllers;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;
import com.luanvan.luanvanbackend.services.SystemConfigurationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-config")
@RequiredArgsConstructor
public class SystemConfigurationController {

    private final SystemConfigurationService systemConfigurationService;

    /**
     * Lấy cấu hình hiện tại của hệ thống (chỉ Admin)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> getCurrentConfigurationForAdmin() {
        SystemConfiguration config = systemConfigurationService.getCurrentConfiguration();
        return ResponseEntity.ok(config);
    }

    /**
     * Lấy cấu hình thanh toán (Public - không cần authentication)
     */
    @GetMapping
    public ResponseEntity<SystemConfiguration> getCurrentConfiguration() {
        SystemConfiguration config = systemConfigurationService.getCurrentConfiguration();
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật cấu hình hệ thống (chỉ Admin)
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateConfiguration(
            @Valid @RequestBody SystemConfigurationDTO configDTO) {
        SystemConfiguration config = systemConfigurationService.updateConfiguration(configDTO);
        return ResponseEntity.ok(config);
    }

    /**
     * Bật/tắt tính năng đặt cọc (chỉ Admin)
     */
    @PutMapping("/deposit/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> toggleDepositFeature(
            @RequestParam boolean enableDeposit) {
        SystemConfiguration config = systemConfigurationService.toggleDepositFeature(enableDeposit);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật số tiền đặt cọc mặc định (chỉ Admin)
     */
    @PutMapping("/deposit/amount")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateDefaultDepositAmount(
            @RequestParam double amount) {
        SystemConfiguration config = systemConfigurationService.updateDefaultDepositAmount(amount);
        return ResponseEntity.ok(config);
    }

    /**
     * Bật/tắt phương thức thanh toán MoMo (chỉ Admin)
     */
    @PutMapping("/payment/momo/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> toggleMomoPayment(
            @RequestParam boolean enableMomo) {
        SystemConfiguration config = systemConfigurationService.toggleMomoPayment(enableMomo);
        return ResponseEntity.ok(config);
    }

    /**
     * Bật/tắt phương thức thanh toán VNPay (chỉ Admin)
     */
    @PutMapping("/payment/vnpay/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> toggleVNPayPayment(
            @RequestParam boolean enableVNPay) {
        SystemConfiguration config = systemConfigurationService.toggleVNPayPayment(enableVNPay);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật phương thức thanh toán mặc định (chỉ Admin)
     */
    @PutMapping("/payment/default-method")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateDefaultPaymentMethod(
            @RequestParam String defaultPaymentMethod) {
        SystemConfiguration config = systemConfigurationService.updateDefaultPaymentMethod(defaultPaymentMethod);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật thông tin cấu hình Momo (chỉ Admin)
     */
    @PutMapping("/payment/momo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateMomoConfiguration(
            @RequestParam(required = false) String partnerCode,
            @RequestParam(required = false) String accessKey,
            @RequestParam(required = false) String secretKey,
            @RequestParam(required = false) String apiEndpoint) {
        SystemConfiguration config = systemConfigurationService.updateMomoConfiguration(
                partnerCode, accessKey, secretKey, apiEndpoint);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật thông tin cấu hình VNPay (chỉ Admin)
     */
    @PutMapping("/payment/vnpay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateVNPayConfiguration(
            @RequestParam(required = false) String tmnCode,
            @RequestParam(required = false) String secretKey) {
        SystemConfiguration config = systemConfigurationService.updateVNPayConfiguration(tmnCode, secretKey);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật thời gian chờ thanh toán (chỉ Admin)
     */
    @PutMapping("/payment/timeout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updatePaymentRetryTimeout(
            @RequestParam int minutes) {
        SystemConfiguration config = systemConfigurationService.updatePaymentRetryTimeout(minutes);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật thời gian giới hạn cho phép bệnh nhân hủy lịch hẹn (chỉ Admin)
     */
    @PutMapping("/cancellation/time-limit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updatePatientCancellationTimeLimit(
            @RequestParam int hours) {
        SystemConfiguration config = systemConfigurationService.updatePatientCancellationTimeLimit(hours);
        return ResponseEntity.ok(config);
    }

    /**
     * Cập nhật nội dung chính sách không hoàn cọc (chỉ Admin)
     */
    @PutMapping("/policy/non-refundable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> updateNonRefundableDepositPolicy(
            @RequestParam String policyText) {
        SystemConfiguration config = systemConfigurationService.updateNonRefundableDepositPolicy(policyText);
        return ResponseEntity.ok(config);
    }

    /**
     * Tạo cấu hình mặc định (chỉ Admin)
     */
    @PostMapping("/default")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfiguration> createDefaultConfiguration() {
        SystemConfiguration config = systemConfigurationService.createDefaultConfiguration();
        return ResponseEntity.ok(config);
    }
} 
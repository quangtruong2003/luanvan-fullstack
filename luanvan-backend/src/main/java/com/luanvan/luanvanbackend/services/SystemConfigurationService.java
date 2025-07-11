package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;

public interface SystemConfigurationService {
    
    /**
     * Lấy cấu hình hiện tại của hệ thống
     * @return Thông tin cấu hình
     */
    SystemConfiguration getCurrentConfiguration();
    
    /**
     * Cập nhật cấu hình hệ thống
     * @param configDTO Thông tin cấu hình mới
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateConfiguration(SystemConfigurationDTO configDTO);
    
    /**
     * Bật/tắt tính năng đặt cọc
     * @param enableDeposit true để bật, false để tắt
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration toggleDepositFeature(boolean enableDeposit);
    
    /**
     * Cập nhật số tiền đặt cọc mặc định
     * @param amount Số tiền đặt cọc
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateDefaultDepositAmount(double amount);
    
    /**
     * Bật/tắt phương thức thanh toán MoMo
     * @param enableMomo true để bật, false để tắt
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration toggleMomoPayment(boolean enableMomo);
    
    /**
     * Bật/tắt phương thức thanh toán VNPay
     * @param enableVNPay true để bật, false để tắt
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration toggleVNPayPayment(boolean enableVNPay);
    
    /**
     * Cập nhật phương thức thanh toán mặc định
     * @param defaultPaymentMethod Phương thức thanh toán ("momo" hoặc "vnpay")
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateDefaultPaymentMethod(String defaultPaymentMethod);
    
    /**
     * Cập nhật thông tin cấu hình Momo
     * @param partnerCode Partner code
     * @param accessKey Access key
     * @param secretKey Secret key
     * @param apiEndpoint API endpoint
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateMomoConfiguration(
            String partnerCode, 
            String accessKey, 
            String secretKey, 
            String apiEndpoint);
    
    /**
     * Cập nhật thông tin cấu hình VNPay
     * @param tmnCode TMN Code
     * @param secretKey Secret Key
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateVNPayConfiguration(
            String tmnCode, 
            String secretKey);
    
    /**
     * Cập nhật thời gian chờ thanh toán (phút)
     * @param minutes Số phút chờ thanh toán
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updatePaymentRetryTimeout(int minutes);
    
    /**
     * Cập nhật thời gian giới hạn cho phép bệnh nhân hủy lịch hẹn (giờ)
     * @param hours Số giờ trước lịch hẹn
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updatePatientCancellationTimeLimit(int hours);
    
    /**
     * Cập nhật nội dung chính sách không hoàn cọc
     * @param policyText Nội dung chính sách
     * @return Cấu hình sau khi cập nhật
     */
    SystemConfiguration updateNonRefundableDepositPolicy(String policyText);
    
    /**
     * Tạo cấu hình mặc định nếu chưa có
     * @return Cấu hình mặc định đã được tạo
     */
    SystemConfiguration createDefaultConfiguration();
} 
package com.luanvan.luanvanbackend.services;

import com.luanvan.luanvanbackend.dto.SystemConfigurationDTO;
import com.luanvan.luanvanbackend.entities.SystemConfiguration;

public interface SystemConfigurationService {

    /**
     * Lấy cấu hình hệ thống hiện tại, hoặc tạo mới nếu chưa có.
     * @return Cấu hình hệ thống.
     */
    SystemConfiguration getSystemConfig();

    /**
     * Cập nhật toàn bộ cấu hình hệ thống từ một DTO.
     * @param configDTO DTO chứa thông tin cần cập nhật.
     * @return Cấu hình đã được cập nhật.
     */
    SystemConfiguration updateSystemConfig(SystemConfigurationDTO configDTO);

    /**
     * Lấy cấu hình hiện tại, ném lỗi nếu không tìm thấy.
     * Dùng nội bộ trong service để đảm bảo cấu hình luôn tồn tại khi thực hiện các tác vụ.
     * @return Cấu hình hệ thống.
     */
    SystemConfiguration getCurrentConfiguration();

    /**
     * Cập nhật cài đặt MoMo
     * @param partnerCode Partner Code mới
     * @param accessKey Access Key mới
     * @param secretKey Secret Key mới
     * @param apiEndpoint Endpoint API mới
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updateMomoConfiguration(String partnerCode, String accessKey, String secretKey, String apiEndpoint);
    
    /**
     * Bật/tắt thanh toán VNPay
     * @param enableVnPay true để bật, false để tắt
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration toggleVNPayPayment(boolean enableVnPay);

    /**
     * Bật/tắt thanh toán MoMo
     * @param enableMomo true để bật, false để tắt
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration toggleMomoPayment(boolean enableMomo);

    /**
     * Bật/tắt tính năng đặt cọc
     * @param enableDeposit true để bật, false để tắt
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration toggleDepositFeature(boolean enableDeposit);

    /**
     * Cập nhật số tiền đặt cọc mặc định
     * @param amount Số tiền mới
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updateDefaultDepositAmount(double amount);

    /**
     * Cập nhật phương thức thanh toán mặc định
     * @param defaultPaymentMethod Tên phương thức mặc định (vd: "momo", "vnpay")
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updateDefaultPaymentMethod(String defaultPaymentMethod);

    /**
     * Tạo cấu hình hệ thống mặc định nếu chưa tồn tại.
     * @return Cấu hình mặc định đã được tạo.
     */
    SystemConfiguration createDefaultConfiguration();

    /**
     * Cập nhật cài đặt VNPay
     * @param tmnCode TMN Code mới
     * @param secretKey Secret Key mới
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updateVNPayConfiguration(String tmnCode, String secretKey);

    /**
     * Cập nhật thời gian chờ retry thanh toán (tính bằng phút)
     * @param minutes Số phút
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updatePaymentRetryTimeout(int minutes);

    /**
     * Cập nhật thời gian giới hạn cho phép bệnh nhân hủy lịch hẹn (tính bằng giờ)
     * @param hours Số giờ
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updatePatientCancellationTimeLimit(int hours);

    /**
     * Cập nhật nội dung chính sách không hoàn cọc
     * @param policyText Nội dung chính sách
     * @return Cấu hình đã cập nhật
     */
    SystemConfiguration updateNonRefundableDepositPolicy(String policyText);
} 
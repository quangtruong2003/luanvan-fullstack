-- Migration V7: Add Payment Method Settings to System Configuration
-- Thêm các cột cài đặt phương thức thanh toán vào bảng system_configuration

-- Thêm cột enable_momo để bật/tắt MoMo
ALTER TABLE system_configuration 
ADD COLUMN enable_momo BOOLEAN DEFAULT TRUE COMMENT 'Bật/tắt phương thức thanh toán MoMo';

-- Thêm cột enable_vnpay để bật/tắt VNPay  
ALTER TABLE system_configuration 
ADD COLUMN enable_vnpay BOOLEAN DEFAULT TRUE COMMENT 'Bật/tắt phương thức thanh toán VNPay';

-- Thêm cột vnpay_tmn_code để lưu TMN Code của VNPay
ALTER TABLE system_configuration 
ADD COLUMN vnpay_tmn_code VARCHAR(50) COMMENT 'TMN Code của VNPay';

-- Thêm cột vnpay_secret_key để lưu Secret Key của VNPay
ALTER TABLE system_configuration 
ADD COLUMN vnpay_secret_key VARCHAR(100) COMMENT 'Secret Key của VNPay';

-- Thêm cột default_payment_method để lưu phương thức thanh toán mặc định
ALTER TABLE system_configuration 
ADD COLUMN default_payment_method VARCHAR(20) DEFAULT 'momo' COMMENT 'Phương thức thanh toán mặc định (momo hoặc vnpay)';

-- Cập nhật dữ liệu mặc định nếu có record tồn tại
UPDATE system_configuration 
SET 
    enable_momo = TRUE,
    enable_vnpay = TRUE,
    default_payment_method = 'momo'
WHERE config_id IS NOT NULL; 
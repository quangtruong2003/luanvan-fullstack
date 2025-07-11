-- V8: Cleanup Duplicate and Inconsistent Payment Columns in system_configuration
-- Dọn dẹp các cột bị trùng lặp và không nhất quán liên quan đến thanh toán trong bảng system_configuration

-- Bước 1: Thêm một cột tạm thời để giữ lại giá trị đúng của enable_vnpay
ALTER TABLE `system_configuration` ADD COLUMN `temp_enable_vn_pay` BIT(1) DEFAULT b'1';

-- Bước 2: Sao chép dữ liệu từ cột `enable_vnpay` (tinyint) hoặc `enablevnpay` (bit) sang cột tạm thời.
-- Ưu tiên giá trị từ cột `enable_vnpay` (tên đúng hơn) nếu nó tồn tại.
UPDATE `system_configuration` SET `temp_enable_vn_pay` = COALESCE(`enable_vnpay`, `enablevnpay`, b'1');

-- Bước 3: Xóa các cột cũ bị sai tên và sai kiểu dữ liệu
-- Xóa cột `enablevnpay` (tên sai, không có dấu gạch dưới)
ALTER TABLE `system_configuration` DROP COLUMN `enablevnpay`;
-- Xóa cột `enable_vnpay` (tên đúng nhưng kiểu dữ liệu là tinyint)
ALTER TABLE `system_configuration` DROP COLUMN `enable_vnpay`;

-- Bước 4: Thêm lại cột `enable_vn_pay` với tên và kiểu dữ liệu chuẩn
ALTER TABLE `system_configuration` ADD COLUMN `enable_vn_pay` BIT(1) NOT NULL DEFAULT b'1' COMMENT 'Bật/tắt phương thức thanh toán VNPay';

-- Bước 5: Cập nhật lại giá trị từ cột tạm thời vào cột mới
UPDATE `system_configuration` SET `enable_vn_pay` = `temp_enable_vn_pay`;

-- Bước 6: Xóa cột tạm thời
ALTER TABLE `system_configuration` DROP COLUMN `temp_enable_vn_pay`; 
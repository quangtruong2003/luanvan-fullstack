-- Đặt VNPay làm phương thức thanh toán mặc định
-- Điều này đảm bảo rằng khi người dùng không chọn phương thức cụ thể,
-- hệ thống sẽ ưu tiên sử dụng VNPay.
UPDATE system_configuration SET default_payment_method = 'vnpay'; 
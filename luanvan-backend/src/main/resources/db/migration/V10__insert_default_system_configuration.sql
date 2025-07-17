-- Insert default system configuration if not exists
INSERT INTO system_configuration (
    enable_deposit,
    default_deposit_amount,
    enable_momo,
    momo_partner_code,
    momo_access_key,
    momo_secret_key,
    momo_api_endpoint,
    enable_vn_pay,
    vnpay_tmn_code,
    vnpay_secret_key,
    default_payment_method,
    patient_cancellation_time_limit_hours,
    payment_retry_timeout_minutes,
    non_refundable_deposit_policy_text
) 
SELECT 
    true,
    50000.00,
    true,
    '',
    '',
    '',
    'https://test-payment.momo.vn/v2/gateway/api/create',
    true,
    '',
    '',
    'momo',
    24,
    15,
    'Nếu bệnh nhân hủy lịch hẹn ít hơn 24 giờ trước thời gian hẹn, tiền đặt cọc sẽ không được hoàn lại.'
WHERE NOT EXISTS (
    SELECT 1 FROM system_configuration LIMIT 1
); 
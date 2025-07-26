-- Tạo bảng clinic_offline_dates để lưu thông tin ngày nghỉ của phòng khám
CREATE TABLE clinic_offline_dates (
    offline_date_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    date DATE NOT NULL,
    reason TEXT,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurring_type VARCHAR(10) DEFAULT 'NONE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON DELETE CASCADE
) COMMENT='Lưu thông tin về các ngày phòng khám không hoạt động';

-- Tạo các index để tối ưu truy vấn
CREATE INDEX idx_clinic_offline_dates_clinic_id ON clinic_offline_dates(clinic_id);
CREATE INDEX idx_clinic_offline_dates_date ON clinic_offline_dates(date);
CREATE INDEX idx_clinic_offline_dates_recurring ON clinic_offline_dates(is_recurring, recurring_type);

-- Tạo index tổng hợp để tối ưu truy vấn kiểm tra ngày nghỉ
CREATE INDEX idx_clinic_offline_dates_clinic_date ON clinic_offline_dates(clinic_id, date); 
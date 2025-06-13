-- Tạo bảng standard_work_shifts cho quản lý ca làm việc tiêu chuẩn
CREATE TABLE IF NOT EXISTS standard_work_shifts (
    shift_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    clinic_id BIGINT,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    
    CONSTRAINT fk_standard_work_shifts_clinic 
        FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) 
        ON DELETE CASCADE,
        
    CONSTRAINT chk_time_range 
        CHECK (start_time < end_time),
        
    -- Allow multiple shifts for same clinic/day but different names
    INDEX idx_clinic_day_time (clinic_id, day_of_week, start_time, end_time)
);

-- Indexes để tối ưu truy vấn
CREATE INDEX idx_standard_work_shifts_clinic ON standard_work_shifts(clinic_id);
CREATE INDEX idx_standard_work_shifts_day ON standard_work_shifts(day_of_week);
CREATE INDEX idx_standard_work_shifts_default ON standard_work_shifts(is_default); 
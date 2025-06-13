-- Script để fix standard_work_shifts table nếu có unique constraint issues
-- Chạy trực tiếp trong MySQL console hoặc database management tool

-- 1. Backup data hiện có (nếu có)
CREATE TABLE IF NOT EXISTS standard_work_shifts_backup AS 
SELECT * FROM standard_work_shifts;

-- 2. Drop table hiện tại để recreate không có unique constraint
DROP TABLE IF EXISTS standard_work_shifts;

-- 3. Recreate table với cấu trúc đúng
CREATE TABLE standard_work_shifts (
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
        CHECK (start_time < end_time)
);

-- 4. Tạo indexes
CREATE INDEX idx_standard_work_shifts_clinic ON standard_work_shifts(clinic_id);
CREATE INDEX idx_standard_work_shifts_day ON standard_work_shifts(day_of_week);
CREATE INDEX idx_standard_work_shifts_default ON standard_work_shifts(is_default);

-- 5. Restore data từ backup (nếu có và cần thiết)
-- INSERT INTO standard_work_shifts SELECT * FROM standard_work_shifts_backup;

-- 6. Drop backup table (sau khi confirm data đã được restore)
-- DROP TABLE standard_work_shifts_backup;

COMMIT; 
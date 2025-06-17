-- Xóa cột working_hours từ bảng clinics
-- Vì đã có bảng standard_work_shifts để quản lý lịch làm việc

ALTER TABLE clinics DROP COLUMN IF EXISTS working_hours; 
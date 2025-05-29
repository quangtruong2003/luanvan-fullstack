-- Thêm role PATIENT nếu chưa tồn tại
INSERT INTO roles (role_name) SELECT 'PATIENT' FROM dual WHERE NOT EXISTS (SELECT * FROM roles WHERE role_name = 'PATIENT');

-- Thêm role DOCTOR nếu chưa tồn tại
INSERT INTO roles (role_name) SELECT 'DOCTOR' FROM dual WHERE NOT EXISTS (SELECT * FROM roles WHERE role_name = 'DOCTOR');

-- Thêm role ADMIN nếu chưa tồn tại
INSERT INTO roles (role_name) SELECT 'ADMIN' FROM dual WHERE NOT EXISTS (SELECT * FROM roles WHERE role_name = 'ADMIN');

-- Thêm role STAFF nếu chưa tồn tại
INSERT INTO roles (role_name) SELECT 'STAFF' FROM dual WHERE NOT EXISTS (SELECT * FROM roles WHERE role_name = 'STAFF');

-- Xóa tài khoản admin và doctor nếu đã tồn tại
DELETE FROM users WHERE phone_number = 'admin';
-- Thêm tài khoản admin với mật khẩu "admin" (mật khẩu đã mã hóa chuẩn spring security)
INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)
SELECT 'admin@example.com', 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Quản trị viên', CURRENT_TIMESTAMP(), 1, r.role_id
FROM roles r WHERE r.role_name = 'ADMIN';

-- Xóa tài khoản doctor nếu đã tồn tại
DELETE FROM users WHERE phone_number = 'doctor';
-- Thêm tài khoản doctor với mật khẩu "doctor" (mật khẩu đã mã hóa chuẩn spring security)
INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)
SELECT 'doctor@example.com', 'doctor', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Bác sĩ', CURRENT_TIMESTAMP(), 1, r.role_id
FROM roles r WHERE r.role_name = 'DOCTOR'; 
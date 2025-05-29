-- Đảm bảo vai trò tồn tại
INSERT INTO roles (role_name) VALUES ('ADMIN') ON DUPLICATE KEY UPDATE role_name=role_name;
INSERT INTO roles (role_name) VALUES ('DOCTOR') ON DUPLICATE KEY UPDATE role_name=role_name;
INSERT INTO roles (role_name) VALUES ('PATIENT') ON DUPLICATE KEY UPDATE role_name=role_name;
INSERT INTO roles (role_name) VALUES ('STAFF') ON DUPLICATE KEY UPDATE role_name=role_name;

-- Xóa tài khoản admin và doctor nếu đã tồn tại
DELETE FROM users WHERE phone_number IN ('admin', 'doctor');

-- Thêm tài khoản admin (sử dụng BCrypt chuẩn của Spring Security cho mật khẩu 'admin')
INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)
SELECT 'admin@example.com', 'admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Quản trị viên', NOW(), 1, r.role_id
FROM roles r WHERE r.role_name = 'ADMIN';

-- Thêm tài khoản doctor (sử dụng BCrypt chuẩn của Spring Security cho mật khẩu 'doctor')
INSERT INTO users (email, phone_number, password_hash, full_name, registration_date, is_active, role_id)
SELECT 'doctor@example.com', 'doctor', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Bác sĩ', NOW(), 1, r.role_id
FROM roles r WHERE r.role_name = 'DOCTOR';

-- Kiểm tra kết quả
SELECT u.user_id, u.phone_number, u.full_name, r.role_name 
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.phone_number IN ('admin', 'doctor'); 
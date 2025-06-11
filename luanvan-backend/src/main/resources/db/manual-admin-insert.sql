-- Đảm bảo vai trò tồn tại
INSERT INTO roles (role_name) VALUES ('ADMIN') ON DUPLICATE KEY UPDATE role_name=role_name;
INSERT INTO roles (role_name) VALUES ('DOCTOR') ON DUPLICATE KEY UPDATE role_name=role_name;
INSERT INTO roles (role_name) VALUES ('PATIENT') ON DUPLICATE KEY UPDATE role_name=role_name;

-- Xóa tài khoản admin và doctor nếu đã tồn tại
DELETE FROM users WHERE phone_number IN ('admin', 'doctor');
-- Kiểm tra kết quả
SELECT u.user_id, u.phone_number, u.full_name, r.role_name 
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.phone_number IN ('admin', 'doctor'); 
-- =======================
-- KHỞI TẠO DỮ LIỆU SAMPLE ĐƠN GIẢN
-- =======================

-- 1. Tạo roles cơ bản
INSERT IGNORE INTO roles (role_name) VALUES ('ADMIN');
INSERT IGNORE INTO roles (role_name) VALUES ('DOCTOR');
INSERT IGNORE INTO roles (role_name) VALUES ('PATIENT');
INSERT IGNORE INTO roles (role_name) VALUES ('STAFF');

-- 2. Tạo admin mặc định
INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye7iKjqrGxW4QZJMDA9C5E/2LV9ZF2.h6', 'System Administrator', 'admin@luanvan.com', 
       (SELECT role_id FROM roles WHERE role_name = 'ADMIN'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = 'admin');

-- 3. Tạo phòng khám mẫu
INSERT IGNORE INTO clinics (name, address, phone_number, email, description, working_hours) VALUES
('Phòng Khám Đa Khoa ABC', '123 Nguyễn Văn Linh, Q7, TP.HCM', '0281234567', 'contact@abc.com', 'Phòng khám đa khoa hiện đại', 'T2-T7: 8:00-20:00'),
('Bệnh Viện Tim Mạch XYZ', '456 Võ Văn Tần, Q3, TP.HCM', '0283456789', 'info@timmach.xyz', 'Chuyên khoa tim mạch', 'T2-CN: 24/7'),
('Phòng Khám Nhi Khoa 123', '789 Cộng Hòa, Tân Bình, TP.HCM', '0285678901', 'support@nhik123.com', 'Chăm sóc sức khỏe trẻ em', 'T2-T6: 7:30-19:00');

-- 4. Tạo chuyên khoa mẫu
INSERT IGNORE INTO specialties (name, description, clinic_id) VALUES
('Tim mạch', 'Chẩn đoán và điều trị bệnh lý tim mạch', 1),
('Nội khoa', 'Khám và điều trị bệnh nội khoa tổng quát', 1),
('Nhi khoa', 'Chăm sóc sức khỏe trẻ em', 3);

-- 5. Tạo bác sĩ mẫu (có thể dùng tên đăng nhập bất kỳ)
INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT 'doctor001', '$2a$10$N9qo8uLOickgx2ZMRZoMye7iKjqrGxW4QZJMDA9C5E/2LV9ZF2.h6', 'BS. Nguyễn Văn A', 'doctor001@luanvan.com', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = 'doctor001');

-- Thêm bác sĩ với tên đăng nhập đa dạng
INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT 'doctor1', '$2a$10$N9qo8uLOickgx2ZMRZoMye7iKjqrGxW4QZJMDA9C5E/2LV9ZF2.h6', 'BS. Trần Văn B', 'doctor1@luanvan.com', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = 'doctor1');

INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT 'bs_tim_mach', '$2a$10$N9qo8uLOickgx2ZMRZoMye7iKjqrGxW4QZJMDA9C5E/2LV9ZF2.h6', 'BS. Lê Thị C', 'bs_tim_mach@luanvan.com', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = 'bs_tim_mach');

-- 6. Tạo bệnh nhân mẫu  
INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT '0123456789', '$2a$10$N9qo8uLOickgx2ZMRZoMye7iKjqrGxW4QZJMDA9C5E/2LV9ZF2.h6', 'Lê Văn C', 'patient001@example.com', 
       (SELECT role_id FROM roles WHERE role_name = 'PATIENT'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = '0123456789');

-- 7. Tạo Doctor Profiles (liên kết với User records) - Loại bỏ profilepictureurl
INSERT IGNORE INTO doctors (user_id, bio, years_of_experience) 
SELECT u.user_id, 'Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm. Tốt nghiệp Đại học Y Hà Nội.', 15
FROM users u 
WHERE u.phone_number = 'doctor001' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

INSERT IGNORE INTO doctors (user_id, bio, years_of_experience)
SELECT u.user_id, 'Bác sĩ Nhi khoa với 12 năm kinh nghiệm. Chuyên điều trị các bệnh lý phức tạp ở trẻ em.', 12
FROM users u
WHERE u.phone_number = 'doctor1' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

INSERT IGNORE INTO doctors (user_id, bio, years_of_experience)
SELECT u.user_id, 'Bác sĩ Tim mạch can thiệp với 10 năm kinh nghiệm. Chuyên gia về siêu âm tim và thông tim.', 10
FROM users u
WHERE u.phone_number = 'bs_tim_mach' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

-- 8. Gán Chuyên khoa cho Doctors (table: doctor_specialty, columns: doctor_id, specialty_id)
-- doctor001 -> Tim mạch (primary)
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.phone_number = 'doctor001'
AND s.name = 'Tim mạch';

-- doctor1 -> Nhi khoa (primary)  
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.phone_number = 'doctor1'
AND s.name = 'Nhi khoa';

-- bs_tim_mach -> Tim mạch (primary)
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.phone_number = 'bs_tim_mach'
AND s.name = 'Tim mạch';

-- Note: Password mặc định là "123456" (đã hash BCrypt) 
-- Chỉ dùng cho testing, production cần passwords mạnh hơn

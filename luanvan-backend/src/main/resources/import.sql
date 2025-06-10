-- =======================
-- KHỞI TẠO DỮ LIỆU SAMPLE ĐƠN GIẢN
-- =======================

-- 1. Tạo roles cơ bản
INSERT IGNORE INTO roles (role_name) VALUES ('ADMIN');
INSERT IGNORE INTO roles (role_name) VALUES ('DOCTOR');
INSERT IGNORE INTO roles (role_name) VALUES ('PATIENT');

-- 2. Admin sẽ được tạo qua API /api/auth/create-first-admin
-- Không tạo admin trong SQL để có thể test API create-first-admin

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

-- 5. Tạo bác sĩ mẫu (đăng nhập bằng email, password: doctor123)
INSERT IGNORE INTO users (email, password_hash, full_name, phone_number, role_id, is_active, registration_date) 
SELECT 'doctor001@luanvan.com', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', 'BS. Nguyễn Văn A', '0987654321', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor001@luanvan.com');

INSERT IGNORE INTO users (email, password_hash, full_name, phone_number, role_id, is_active, registration_date) 
SELECT 'doctor1@luanvan.com', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', 'BS. Trần Văn B', '0987654322', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor1@luanvan.com');

INSERT IGNORE INTO users (email, password_hash, full_name, phone_number, role_id, is_active, registration_date) 
SELECT 'bs_tim_mach@luanvan.com', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', 'BS. Lê Thị C', '0987654323', 
       (SELECT role_id FROM roles WHERE role_name = 'DOCTOR'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bs_tim_mach@luanvan.com');

-- 6. Tạo bệnh nhân mẫu (vẫn đăng nhập bằng phone để test hybrid auth)
INSERT IGNORE INTO users (phone_number, password_hash, full_name, email, role_id, is_active, registration_date) 
SELECT '0123456789', '$2a$10$dXJ3SW6G7P65h.E47kK0VeEkXMfMXF1Ht8Y4JhEKnCJlAiaBhE75i', 'Lê Văn C', 'patient001@example.com', 
       (SELECT role_id FROM roles WHERE role_name = 'PATIENT'), true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE phone_number = '0123456789');

-- 7. Tạo Doctor Profiles (liên kết với User records)
INSERT IGNORE INTO doctors (user_id, bio, years_of_experience) 
SELECT u.user_id, 'Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm. Tốt nghiệp Đại học Y Hà Nội.', 15
FROM users u 
WHERE u.email = 'doctor001@luanvan.com' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

INSERT IGNORE INTO doctors (user_id, bio, years_of_experience)
SELECT u.user_id, 'Bác sĩ Nhi khoa với 12 năm kinh nghiệm. Chuyên điều trị các bệnh lý phức tạp ở trẻ em.', 12
FROM users u
WHERE u.email = 'doctor1@luanvan.com' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

INSERT IGNORE INTO doctors (user_id, bio, years_of_experience)
SELECT u.user_id, 'Bác sĩ Tim mạch can thiệp với 10 năm kinh nghiệm. Chuyên gia về siêu âm tim và thông tim.', 10
FROM users u
WHERE u.email = 'bs_tim_mach@luanvan.com' AND u.role_id = (SELECT role_id FROM roles WHERE role_name = 'DOCTOR');

-- 8. Gán Chuyên khoa cho Doctors
-- doctor001@luanvan.com -> Tim mạch (primary)
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.email = 'doctor001@luanvan.com'
AND s.name = 'Tim mạch';

-- doctor1@luanvan.com -> Nhi khoa (primary)  
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.email = 'doctor1@luanvan.com'
AND s.name = 'Nhi khoa';

-- bs_tim_mach@luanvan.com -> Tim mạch (primary)
INSERT IGNORE INTO doctor_specialty (doctor_id, specialty_id, is_primary)
SELECT d.user_id, s.specialty_id, true
FROM doctors d, specialties s, users u
WHERE d.user_id = u.user_id 
AND u.email = 'bs_tim_mach@luanvan.com'
AND s.name = 'Tim mạch';

-- ===============================
-- THÔNG TIN ĐĂNG NHẬP TESTING:
-- ===============================
-- Admin: Tạo bằng API POST /api/auth/create-first-admin
--   Request body: {"email": "admin@luanvan.com", "password": "admin123", "fullName": "System Administrator"}
-- Doctor 1: email=doctor001@luanvan.com, password=doctor123  
-- Doctor 2: email=doctor1@luanvan.com, password=doctor123
-- Doctor 3: email=bs_tim_mach@luanvan.com, password=doctor123
-- Patient: phone=0123456789, password=patient123

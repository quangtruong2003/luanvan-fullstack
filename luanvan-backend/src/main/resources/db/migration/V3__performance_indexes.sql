-- Advanced Performance Indexes for High-Traffic Queries

-- Composite indexes for appointment filtering
CREATE INDEX idx_appointment_doctor_status_date ON appointments(doctor_id, status, appointment_date_time);
CREATE INDEX idx_appointment_patient_status_date ON appointments(patient_id, status, appointment_date_time);
CREATE INDEX idx_appointment_clinic_date_status ON appointments(clinic_id, appointment_date_time, status);

-- Composite indexes for doctor specialty lookup
CREATE INDEX idx_doctor_specialty_primary ON doctor_specialty(doctor_id, is_primary);
CREATE INDEX idx_doctor_specialty_specialty_primary ON doctor_specialty(specialty_id, is_primary);

-- Composite indexes for payment lookup
CREATE INDEX idx_payment_appointment_status_date ON payments(appointment_id, status, created_at);
CREATE INDEX idx_payment_provider_status_date ON payments(provider, status, created_at);
CREATE INDEX idx_payment_gateway_order_provider ON payments(gateway_order_id, provider);

-- Composite indexes for availability slot queries
CREATE INDEX idx_slot_doctor_date_time_status ON availability_slots(doctor_id, date, start_time, status);
CREATE INDEX idx_slot_clinic_date_status ON availability_slots(clinic_id, date, status);
CREATE INDEX idx_slot_specialty_date_status ON availability_slots(specialty_id, date, status);

-- Composite indexes for user lookups
CREATE INDEX idx_user_role_active ON users(role_id, is_active);
CREATE INDEX idx_user_email_active ON users(email, is_active);
CREATE INDEX idx_user_phone_active ON users(phone_number, is_active);

-- Composite indexes for article filtering
CREATE INDEX idx_article_author_status_published ON articles(author_id, status, published_date);
CREATE INDEX idx_article_category_status ON articles(category, status);
CREATE INDEX idx_article_title_status ON articles(title, status);

-- For summarizing appointment details efficiently
CREATE INDEX idx_appointment_summary ON appointments(appointment_id, doctor_id, patient_id, clinic_id, status);

-- Full-text search indexes for better search performance
ALTER TABLE articles ADD FULLTEXT(title, content);
ALTER TABLE clinics ADD FULLTEXT(name, description);
ALTER TABLE specialties ADD FULLTEXT(name, description);

-- Covering indexes to avoid lookups
CREATE INDEX idx_appointment_summary ON appointments(doctor_id, patient_id, appointment_date_time, status) 
INCLUDE (clinic_id, specialty_id, deposit_amount);

-- Statistics for query optimizer
ANALYZE TABLE users;
ANALYZE TABLE doctors;
ANALYZE TABLE appointments;
ANALYZE TABLE availability_slots;
ANALYZE TABLE payments;
ANALYZE TABLE articles;
ANALYZE TABLE clinics;
ANALYZE TABLE specialties; 
-- Indexes for User table
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_phone ON users(phone_number);
CREATE INDEX idx_user_role ON users(role_id);
CREATE INDEX idx_user_active ON users(is_active);

-- Indexes for Doctor table
CREATE INDEX idx_doctor_user ON doctors(doctor_id);

-- Indexes for DoctorSpecialty table
CREATE INDEX idx_doctor_specialty_doctor ON doctor_specialties(doctor_id);
CREATE INDEX idx_doctor_specialty_specialty ON doctor_specialties(specialty_id);

-- Indexes for Specialty table
CREATE INDEX idx_specialty_clinic ON specialties(clinic_id);
CREATE INDEX idx_specialty_name ON specialties(name);

-- Indexes for AvailabilitySlot table
CREATE INDEX idx_slot_doctor ON availability_slots(doctor_id);
CREATE INDEX idx_slot_date ON availability_slots(date);
CREATE INDEX idx_slot_status ON availability_slots(status);
CREATE INDEX idx_slot_doctor_date ON availability_slots(doctor_id, date);
CREATE INDEX idx_slot_doctor_date_status ON availability_slots(doctor_id, date, status);

-- Indexes for Appointment table
CREATE INDEX idx_appointment_patient ON appointments(patient_id);
CREATE INDEX idx_appointment_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointment_slot ON appointments(slot_id);
CREATE INDEX idx_appointment_status ON appointments(status);
CREATE INDEX idx_appointment_date ON appointments(appointment_date_time);
CREATE INDEX idx_appointment_patient_status ON appointments(patient_id, status);
CREATE INDEX idx_appointment_doctor_date ON appointments(doctor_id, appointment_date_time);

-- Indexes for Payment table
CREATE INDEX idx_payment_appointment ON payments(appointment_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_method ON payments(payment_method);
CREATE INDEX idx_payment_gateway_trans ON payments(gateway_transaction_id);
CREATE INDEX idx_payment_created ON payments(created_at);
CREATE INDEX idx_payment_expired ON payments(expired_at);

-- Indexes for Article table
CREATE INDEX idx_article_author ON articles(author_id);
CREATE INDEX idx_article_status ON articles(status);
CREATE INDEX idx_article_published ON articles(published_date);
CREATE INDEX idx_article_category ON articles(category); 
-- V5: Enhance AvailabilitySlot table with new fields for improved schedule management
-- Author: LuanVan Team
-- Date: 2024

-- Add new columns to availability_slots table
ALTER TABLE availability_slots 
ADD COLUMN IF NOT EXISTS specialty_id BIGINT,
ADD COLUMN IF NOT EXISTS slot_duration_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_from_shift_id BIGINT;

-- Add foreign key constraint for specialty_id
ALTER TABLE availability_slots 
ADD CONSTRAINT IF NOT EXISTS fk_availability_slots_specialty 
FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id) ON DELETE SET NULL;

-- Add foreign key constraint for created_from_shift_id
ALTER TABLE availability_slots 
ADD CONSTRAINT IF NOT EXISTS fk_availability_slots_work_shift 
FOREIGN KEY (created_from_shift_id) REFERENCES standard_work_shifts(shift_id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_specialty_id ON availability_slots(specialty_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_auto_generated ON availability_slots(auto_generated);
CREATE INDEX IF NOT EXISTS idx_availability_slots_created_from_shift ON availability_slots(created_from_shift_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_doctor_specialty_date ON availability_slots(doctor_id, specialty_id, date);

-- Create composite index for conflict detection queries
CREATE INDEX IF NOT EXISTS idx_availability_slots_conflict_detection 
ON availability_slots(doctor_id, date, start_time, status) 
WHERE status = 'AVAILABLE';

-- Update existing slots to have default values
UPDATE availability_slots 
SET slot_duration_minutes = 30 
WHERE slot_duration_minutes IS NULL;

UPDATE availability_slots 
SET auto_generated = FALSE 
WHERE auto_generated IS NULL;

-- Add check constraint for slot_duration_minutes
ALTER TABLE availability_slots 
ADD CONSTRAINT IF NOT EXISTS chk_slot_duration_minutes 
CHECK (slot_duration_minutes >= 15 AND slot_duration_minutes <= 120);

-- Add comment to table
COMMENT ON TABLE availability_slots IS 'Enhanced availability slots table with specialty linking and auto-generation support';
COMMENT ON COLUMN availability_slots.specialty_id IS 'Links slot to specific specialty for multi-specialty doctors';
COMMENT ON COLUMN availability_slots.slot_duration_minutes IS 'Duration of the slot in minutes (15-120)';
COMMENT ON COLUMN availability_slots.auto_generated IS 'Indicates if slot was auto-generated from work shifts';
COMMENT ON COLUMN availability_slots.notes IS 'Doctor notes for this specific slot';
COMMENT ON COLUMN availability_slots.created_from_shift_id IS 'ID of the StandardWorkShift that created this slot'; 
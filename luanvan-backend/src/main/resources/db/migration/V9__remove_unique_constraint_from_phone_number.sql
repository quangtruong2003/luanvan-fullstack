-- Remove unique constraint from phone_number column in users table for MySQL
-- This allows duplicate phone numbers in the system

-- The actual constraint name found in the database
ALTER TABLE users DROP INDEX UK9q63snka3mdh91as4io72espi;

-- Alternative approach for future reference:
-- If you need to find the constraint name again, run:
-- SHOW INDEX FROM users WHERE Column_name = 'phone_number' AND Non_unique = 0;

-- Verify the constraint is removed by running:
-- SHOW INDEX FROM users WHERE Column_name = 'phone_number'; 
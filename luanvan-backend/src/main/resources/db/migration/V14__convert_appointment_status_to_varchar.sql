-- MIGRATION TO PREVENT 'DATA TRUNCATED' ERROR FOR APPOINTMENT STATUS
-- This migration changes the `status` column in the `appointments` table from an ENUM type
-- to a VARCHAR(50). The ENUM type is too restrictive and can cause errors if the Java
-- enum values do not perfectly match the database ENUM definition.
-- Using VARCHAR provides more flexibility for future status additions without requiring
-- further schema changes.

ALTER TABLE appointments MODIFY COLUMN status VARCHAR(50);

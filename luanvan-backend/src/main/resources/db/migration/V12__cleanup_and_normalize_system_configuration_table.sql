-- Move data from old column to new column if the new one is null
UPDATE system_configuration 
SET non_refundable_deposit_policy = non_refundable_deposit_policy_text
WHERE non_refundable_deposit_policy IS NULL AND non_refundable_deposit_policy_text IS NOT NULL;

-- Remove the old, redundant, and unknown columns
ALTER TABLE system_configuration
  DROP COLUMN non_refundable_deposit_policy_text,
  DROP COLUMN temp_enable_vn_pay; 
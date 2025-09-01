-- Check what valid values are allowed for split_type in rent_payments table
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.rent_payments'::regclass 
  AND conname = 'rent_payments_split_type_check';

-- Check what values are allowed for document_verification_status
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.user_profiles'::regclass 
  AND contype = 'c'
  AND conname LIKE '%document_verification_status%';

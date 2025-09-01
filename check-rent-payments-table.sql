-- Check if rent_payments table exists and what its structure looks like
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%payment%'
ORDER BY table_name;

-- If rent_payments exists, check its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'rent_payments'
ORDER BY ordinal_position;

-- Check what columns exist in the rent_splits table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'rent_splits'
ORDER BY ordinal_position;

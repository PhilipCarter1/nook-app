-- Simple query to see tenants table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants'
ORDER BY ordinal_position;

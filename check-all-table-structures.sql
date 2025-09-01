-- Check the actual structure of all tables we're trying to insert into
-- This will show us exactly what columns exist so we can fix everything at once

-- 1. Check payments table structure
SELECT 
  'PAYMENTS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- 2. Check property_settings table structure
SELECT 
  'PROPERTY_SETTINGS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'property_settings' 
ORDER BY ordinal_position;

-- 3. Check payment_methods table structure
SELECT 
  'PAYMENT_METHODS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
ORDER BY ordinal_position;

-- 4. Check maintenance_tickets table structure
SELECT 
  'MAINTENANCE_TICKETS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'maintenance_tickets' 
ORDER BY ordinal_position;

-- 5. Check documents table structure
SELECT 
  'DOCUMENTS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;

-- Check what enum values are valid for property status
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = (
  SELECT udt_name 
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'status'
);

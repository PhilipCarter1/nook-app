-- Create test users for Document Approval Testing
-- Run this script in your Supabase SQL editor

-- Create test landlord user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'landlord@test.nook.com',
  crypt('TestLandlord123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Landlord", "role": "landlord"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create test admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@test.nook.com',
  crypt('TestAdmin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Admin", "role": "admin"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create test tenant user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'tenant@test.nook.com',
  crypt('TestTenant123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Tenant", "role": "tenant"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user IDs for profile creation
DO $$
DECLARE
  landlord_id uuid;
  admin_id uuid;
  tenant_id uuid;
BEGIN
  -- Get landlord ID
  SELECT id INTO landlord_id FROM auth.users WHERE email = 'landlord@test.nook.com';
  
  -- Get admin ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.nook.com';
  
  -- Get tenant ID
  SELECT id INTO tenant_id FROM auth.users WHERE email = 'tenant@test.nook.com';
  
  -- Create landlord profile
  IF landlord_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      email_verified,
      created_at,
      updated_at
    ) VALUES (
      landlord_id,
      'landlord@test.nook.com',
      'Test',
      'Landlord',
      'landlord',
      true,
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Create admin profile
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      email_verified,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'admin@test.nook.com',
      'Test',
      'Admin',
      'admin',
      true,
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Create tenant profile
  IF tenant_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      email_verified,
      created_at,
      updated_at
    ) VALUES (
      tenant_id,
      'tenant@test.nook.com',
      'Test',
      'Tenant',
      'tenant',
      true,
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create test property for landlord
INSERT INTO public.properties (
  id,
  name,
  address,
  city,
  state,
  zip_code,
  owner_id,
  status,
  monthly_rent,
  security_deposit,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Sunset Apartments',
  '123 Sunset Blvd',
  'Los Angeles',
  'CA',
  '90028',
  (SELECT id FROM auth.users WHERE email = 'landlord@test.nook.com'),
  'available',
  2500.00,
  2500.00,
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Create test unit
INSERT INTO public.units (
  id,
  property_id,
  unit_number,
  floor,
  bedrooms,
  bathrooms,
  square_feet,
  rent_amount,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.properties WHERE name = 'Sunset Apartments'),
  '101',
  1,
  2,
  1,
  1000,
  2500.00,
  'available',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Create sample pending documents for testing
INSERT INTO public.documents (
  id,
  tenant_id,
  type,
  name,
  url,
  version,
  status,
  metadata,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'tenant@test.nook.com'),
  'lease',
  'Lease Agreement - Unit 101',
  'https://example.com/test-lease.pdf',
  1,
  'pending',
  '{"size": 2048576, "mimeType": "application/pdf", "pages": 5}',
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'tenant@test.nook.com'),
  'application',
  'Rental Application - Unit 101',
  'https://example.com/test-application.pdf',
  1,
  'pending',
  '{"size": 1024000, "mimeType": "application/pdf", "pages": 3}',
  now(),
  now()
),
(
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'tenant@test.nook.com'),
  'id_verification',
  'ID Verification - Unit 101',
  'https://example.com/test-id.pdf',
  1,
  'pending',
  '{"size": 512000, "mimeType": "application/pdf", "pages": 2}',
  now(),
  now()
);

-- Display created test users
SELECT 
  'Test Users Created Successfully!' as status,
  'landlord@test.nook.com' as landlord_email,
  'admin@test.nook.com' as admin_email,
  'tenant@test.nook.com' as tenant_email; 
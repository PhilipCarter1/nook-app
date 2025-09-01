-- =====================================================
-- CREATE REAL-LIFE TESTING SCENARIO (CORRECTED VERSION)
-- =====================================================
-- This script creates a complete testing environment with:
-- - Landlords with properties
-- - Tenants with leases and documents
-- - Admins overseeing everything
-- - Real document approval workflows
-- - Payment scenarios for testing

-- 1. CREATE TEST USERS (All with password: Test123!)
-- =====================================================

-- Super Admin
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'superadmin@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Super Admin", "role": "super"}',
  true,
  'conf_123',
  'rec_123'
) ON CONFLICT (id) DO NOTHING;

-- Admin
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'admin@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Platform Admin", "role": "admin"}',
  false,
  'conf_124',
  'rec_124'
) ON CONFLICT (id) DO NOTHING;

-- Landlord 1 (Sarah Johnson)
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'sarah.landlord@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sarah Johnson", "role": "landlord"}',
  false,
  'conf_125',
  'rec_125'
) ON CONFLICT (id) DO NOTHING;

-- Landlord 2 (Mike Chen)
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  'mike.landlord@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Mike Chen", "role": "landlord"}',
  false,
  'conf_126',
  'rec_126'
) ON CONFLICT (id) DO NOTHING;

-- Tenant 1 (Emma Davis)
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'emma.tenant@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Emma Davis", "role": "tenant"}',
  false,
  'conf_127',
  'rec_127'
) ON CONFLICT (id) DO NOTHING;

-- Tenant 2 (Alex Rodriguez)
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'alex.tenant@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Alex Rodriguez", "role": "tenant"}',
  false,
  'conf_128',
  'rec_128'
) ON CONFLICT (id) DO NOTHING;

-- Tenant 3 (Jordan Smith)
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
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  'jordan.tenant@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Jordan Smith", "role": "tenant"}',
  false,
  'conf_129',
  'rec_129'
) ON CONFLICT (id) DO NOTHING;

-- 2. CREATE PROPERTIES
-- =====================================================

INSERT INTO public.properties (
  id,
  name,
  address,
  city,
  state,
  zip_code,
  property_type,
  total_units,
  owner_id,
  landlord_id,
  monthly_rent,
  security_deposit,
  available_from,
  status,
  description,
  amenities,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', 'Sunset Gardens', '123 Sunset Blvd', 'Los Angeles', 'CA', '90210', 'apartment', 12, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 2800, 2800, '2024-01-01', 'active', 'Beautiful garden-style apartments with pool access', '["pool", "gym", "parking", "laundry"]', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440021', 'Downtown Lofts', '456 Main Street', 'San Francisco', 'CA', '94102', 'loft', 8, '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 3500, 3500, '2024-01-01', 'active', 'Modern urban lofts in the heart of downtown', '["rooftop", "concierge", "parking", "fitness"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. CREATE UNITS
-- =====================================================

INSERT INTO public.units (
  id,
  property_id,
  unit_number,
  floor,
  bedrooms,
  bathrooms,
  square_feet,
  monthly_rent,
  status,
  features,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'A101', 1, 2, 1, 850, 1400, 'occupied', '["balcony", "hardwood_floors", "dishwasher"]', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', 'A102', 1, 1, 1, 650, 1200, 'occupied', '["balcony", "carpet", "dishwasher"]', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', 'L201', 2, 1, 1, 750, 1750, 'occupied', '["high_ceilings", "exposed_brick", "balcony"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. CREATE TENANTS TABLE ENTRIES (CORRECTED FOR YOUR STRUCTURE)
-- =====================================================

INSERT INTO public.tenants (
  id,
  user_id,
  unit_id,
  status,
  documents,
  payment_status,
  payment_method,
  payment_receipt,
  split_rent,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440030', 'active', '{"id": "approved", "income": "approved", "address": "approved"}', 'paid', 'stripe', 'receipt_emma_jan2024', '{"enabled": true, "amount": 1400, "paid": 1400}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440031', 'active', '{"id": "pending", "income": "pending"}', 'paid', 'stripe', 'receipt_alex_jan2024', '{"enabled": true, "amount": 1200, "paid": 1200}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440032', 'active', '{"id": "rejected", "income": "rejected"}', 'pending', 'paypal', null, '{"enabled": false, "amount": 1750, "paid": 0}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. CREATE LEASES
-- =====================================================

INSERT INTO public.leases (
  id,
  property_id,
  unit_id,
  tenant_id,
  start_date,
  end_date,
  monthly_rent,
  security_deposit,
  status,
  terms,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', '2024-01-01', '2024-12-31', 1400, 1400, 'active', 'Standard 12-month lease with option to renew', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', '2024-01-01', '2024-12-31', 1200, 1200, 'active', 'Standard 12-month lease with option to renew', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440007', '2024-01-01', '2024-12-31', 1750, 1750, 'active', 'Standard 12-month lease with option to renew', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 6. CREATE RENT SPLITS (for shared units)
-- =====================================================

INSERT INTO public.rent_splits (
  id,
  lease_id,
  tenant_id,
  share_amount,
  paid_amount,
  status,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440005', 1400, 1400, 'paid', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440006', 1200, 1200, 'paid', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440007', 1750, 0, 'pending', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. CREATE PAYMENTS
-- =====================================================

INSERT INTO public.payments (
  id,
  lease_id,
  amount,
  payment_date,
  payment_method,
  status,
  notes,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440040', 1400, '2024-01-01', 'stripe', 'completed', 'January rent payment', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440041', 1200, '2024-01-01', 'stripe', 'completed', 'January rent payment', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440042', 1750, '2024-01-01', 'pending', 'pending', 'Payment due - tenant notified', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 8. CREATE DOCUMENTS (for document approval testing)
-- =====================================================

INSERT INTO public.documents (
  id,
  property_id,
  unit_id,
  type,
  name,
  file_path,
  status,
  user_id,
  created_at,
  updated_at
) VALUES 
  -- Emma's documents (approved)
  ('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', 'id', 'Drivers_License_Emma_Davis.pdf', '/documents/emma/id/drivers_license.pdf', 'approved', '550e8400-e29b-41d4-a716-446655440005', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', 'proof_of_income', 'Paystub_Emma_Davis_Jan2024.pdf', '/documents/emma/income/paystub_jan.pdf', 'approved', '550e8400-e29b-41d4-a716-446655440005', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', 'proof_of_address', 'Utility_Bill_Emma_Davis.pdf', '/documents/emma/address/utility_bill.pdf', 'approved', '550e8400-e29b-41d4-a716-446655440005', now(), now()),
  
  -- Alex's documents (pending approval)
  ('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440031', 'id', 'Passport_Alex_Rodriguez.pdf', '/documents/alex/id/passport.pdf', 'pending', '550e8400-e29b-41d4-a716-446655440006', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440031', 'proof_of_income', 'Employment_Letter_Alex_Rodriguez.pdf', '/documents/alex/income/employment_letter.pdf', 'pending', '550e8400-e29b-41d4-a716-446655440006', now(), now()),
  
  -- Jordan's documents (rejected - needs resubmission)
  ('550e8400-e29b-41d4-a716-446655440075', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440032', 'id', 'Student_ID_Jordan_Smith.pdf', '/documents/jordan/id/student_id.pdf', 'rejected', '550e8400-e29b-41d4-a716-446655440007', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440076', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440032', 'proof_of_income', 'Financial_Aid_Letter_Jordan_Smith.pdf', '/documents/jordan/income/financial_aid.pdf', 'rejected', '550e8400-e29b-41d4-a716-446655440007', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 9. CREATE MAINTENANCE TICKETS (for testing maintenance features)
-- =====================================================

INSERT INTO public.maintenance_tickets (
  id,
  property_id,
  unit_id,
  tenant_id,
  title,
  description,
  priority,
  status,
  category,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', 'Leaky Faucet', 'Kitchen faucet is dripping constantly', 'medium', 'in_progress', 'plumbing', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', 'Broken Window', 'Bedroom window will not close properly', 'high', 'open', 'windows', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440007', 'AC Not Working', 'Air conditioning unit making strange noises', 'high', 'open', 'hvac', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 10. CREATE PROPERTY SETTINGS (for split rent configuration)
-- =====================================================

INSERT INTO public.property_settings (
  id,
  property_id,
  split_rent_enabled,
  payment_methods,
  late_fee_percentage,
  grace_period_days,
  auto_reminders,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440020', true, '["stripe", "paypal", "bank_transfer"]', 5.00, 5, true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440021', false, '["stripe", "paypal"]', 3.00, 3, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 11. CREATE PAYMENT METHODS (for testing payment features)
-- =====================================================

INSERT INTO public.payment_methods (
  id,
  user_id,
  type,
  is_default,
  is_enabled,
  metadata,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440005', 'stripe', true, true, '{"card_last4": "4242", "card_brand": "visa"}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440006', 'stripe', true, true, '{"card_last4": "5555", "card_brand": "mastercard"}', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440007', 'paypal', true, true, '{"paypal_email": "jordan.smith@email.com"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 12. FINAL VERIFICATION - SHOW WHAT WE CREATED
-- =====================================================

SELECT 
  'TEST SCENARIO CREATED' as check_type,
  'All test accounts and data created successfully!' as status;

SELECT 
  'TEST ACCOUNTS SUMMARY' as check_type,
  role,
  email,
  password,
  'Use these to test the platform' as note
FROM (
  VALUES 
    ('Super Admin', 'superadmin@nook.com', 'Test123!'),
    ('Admin', 'admin@nook.com', 'Test123!'),
    ('Landlord 1', 'sarah.landlord@nook.com', 'Test123!'),
    ('Landlord 2', 'mike.landlord@nook.com', 'Test123!'),
    ('Tenant 1', 'emma.tenant@nook.com', 'Test123!'),
    ('Tenant 2', 'alex.tenant@nook.com', 'Test123!'),
    ('Tenant 3', 'jordan.tenant@nook.com', 'Test123!')
) AS t(role, email, password);

SELECT 
  'TESTING SCENARIOS' as check_type,
  scenario,
  description,
  'Ready to test!' as status
FROM (
  VALUES 
    ('Document Approval', 'Emma (approved), Alex (pending), Jordan (rejected)', 'Test document workflow'),
    ('Split Rent Payments', 'Sunset Gardens has split enabled, Downtown Lofts disabled', 'Test payment configurations'),
    ('Maintenance Tickets', '3 active tickets in different states', 'Test maintenance workflow'),
    ('Property Management', '2 properties with different settings', 'Test landlord features'),
    ('Payment Processing', 'Different payment statuses and methods', 'Test payment system')
) AS t(scenario, description, status);

SELECT 
  'READY TO TEST' as check_type,
  'Your platform is now populated with real test data!' as message,
  'Go to https://nook-ihrtscirl-philip-carters-projects.vercel.app and start testing!' as next_step;

-- Enable all modules for testing
INSERT INTO client_config (id, enabled_modules)
VALUES (
  'default',
  ARRAY['concierge', 'branding', 'legal_assistant']
)
ON CONFLICT (id) DO UPDATE
SET enabled_modules = ARRAY['concierge', 'branding', 'legal_assistant'];

-- Create a test property
INSERT INTO properties (
  id,
  name,
  address,
  city,
  state,
  zip_code,
  property_type,
  module_config
)
VALUES (
  'test-property-1',
  'Test Property',
  '123 Test St',
  'Test City',
  'TS',
  '12345',
  'apartment',
  '{
    "concierge": true,
    "branding": true,
    "legal_assistant": true
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET module_config = '{
  "concierge": true,
  "branding": true,
  "legal_assistant": true
}'::jsonb;

-- Create a test unit
INSERT INTO units (
  id,
  property_id,
  unit_number,
  floor,
  square_footage,
  bedrooms,
  bathrooms,
  monthly_rent,
  module_config
)
VALUES (
  'test-unit-1',
  'test-property-1',
  '101',
  1,
  800,
  2,
  1,
  2000.00,
  '{
    "concierge": true,
    "branding": true,
    "legal_assistant": true
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET module_config = '{
  "concierge": true,
  "branding": true,
  "legal_assistant": true
}'::jsonb;

-- Create a test user (if not exists)
INSERT INTO users (
  id,
  email,
  full_name,
  role
)
VALUES (
  'test-user-1',
  'test@example.com',
  'Test User',
  'tenant'
)
ON CONFLICT (id) DO NOTHING;

-- Assign user to unit
INSERT INTO tenants (
  id,
  user_id,
  unit_id,
  status
)
VALUES (
  'test-tenant-1',
  'test-user-1',
  'test-unit-1',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Create a test landlord
INSERT INTO users (
  id,
  email,
  full_name,
  role
)
VALUES (
  'test-landlord-1',
  'landlord@example.com',
  'Test Landlord',
  'landlord'
)
ON CONFLICT (id) DO NOTHING;

-- Assign landlord to property
INSERT INTO property_owners (
  id,
  user_id,
  property_id
)
VALUES (
  'test-owner-1',
  'test-landlord-1',
  'test-property-1'
)
ON CONFLICT (id) DO NOTHING;

-- Insert test users
INSERT INTO users (id, email, name, role, phone, email_verified)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'landlord@test.com', 'Test Landlord', 'landlord', '+1234567890', true),
    ('00000000-0000-0000-0000-000000000002', 'tenant@test.com', 'Test Tenant', 'tenant', '+1234567891', true),
    ('00000000-0000-0000-0000-000000000003', 'admin@test.com', 'Test Admin', 'admin', '+1234567892', true);

-- Insert test property
INSERT INTO properties (id, name, address, type, units, landlord_id, status, monthly_rent, security_deposit)
VALUES 
    ('00000000-0000-0000-0000-000000000101', 'Sunset Apartments', '123 Main St', 'apartment', 4, '00000000-0000-0000-0000-000000000001', 'available', 2000.00, 2000.00);

-- Insert test lease
INSERT INTO leases (id, property_id, tenant_id, start_date, end_date, status, monthly_rent, security_deposit)
VALUES 
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002', '2024-01-01', '2024-12-31', 'active', 2000.00, 2000.00);

-- Insert test property amenities
INSERT INTO property_amenities (id, property_id, name, description)
VALUES 
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'Swimming Pool', 'Outdoor swimming pool'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101', 'Gym', 'Fitness center');

-- Insert test property media
INSERT INTO property_media (id, property_id, type, url, title)
VALUES 
    ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', 'image', 'https://example.com/property1.jpg', 'Front View'),
    ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000101', 'image', 'https://example.com/property2.jpg', 'Living Room');

-- Insert test lease document
INSERT INTO lease_documents (id, lease_id, version, document_url, status, created_by)
VALUES 
    ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000201', 1, 'https://example.com/lease1.pdf', 'approved', '00000000-0000-0000-0000-000000000001');

-- Insert test maintenance schedule
INSERT INTO maintenance_schedule (id, property_id, title, description, frequency, next_due)
VALUES 
    ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000101', 'HVAC Maintenance', 'Regular HVAC system check', 'monthly', '2024-04-01');

-- Insert test payment
INSERT INTO payments (id, lease_id, amount, type, status, due_date)
VALUES 
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000201', 2000.00, 'rent', 'pending', '2024-04-01');

-- Insert test payment receipt
INSERT INTO payment_receipts (id, payment_id, receipt_number, receipt_url)
VALUES 
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000701', 'REC-001', 'https://example.com/receipt1.pdf'); 
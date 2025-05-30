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
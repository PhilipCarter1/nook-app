-- Create test accounts for each role (if they don't exist)
INSERT INTO users (id, email, first_name, last_name, role, email_verified)
VALUES 
    ('test-admin-1, 'admin@rentwithnook.com', Admin', 'User', 'admin', true),
    (test-landlord-1landlord@rentwithnook.com',Test',Landlord', 'landlord', true),
    (test-tenant-1',tenant@rentwithnook.com,Test',Tenant',tenant', true),
    ('test-super-1, 'super@rentwithnook.com,Super,Admin,super', true)
ON CONFLICT (id) DO NOTHING;

-- Create test property
INSERT INTO properties (id, name, address, city, state, zip_code, owner_id, status, monthly_rent, security_deposit)
VALUES 
    (test-property-1Sunset Apartments', '123 St', Los Angeles', 'CA', '90210, test-landlord-1, available', 250025000)
ON CONFLICT (id) DO NOTHING;

-- Create test unit
INSERT INTO units (id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, rent_amount, status)
VALUES 
    ('test-unit-1, test-property-1, 101,1 2, 10.5, 1000, 250000available)
ON CONFLICT (id) DO NOTHING;

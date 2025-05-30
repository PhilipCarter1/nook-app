-- Add module configuration to client_config
ALTER TABLE client_config
ADD COLUMN enabled_modules TEXT[] DEFAULT '{}';

-- Add module configuration to properties and units
ALTER TABLE properties
ADD COLUMN module_config JSONB DEFAULT '{}';

ALTER TABLE units
ADD COLUMN module_config JSONB DEFAULT '{}';

-- Create RLS policies for module configuration
CREATE POLICY "Enable read access for authenticated users"
ON client_config
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON properties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users"
ON units
FOR SELECT
TO authenticated
USING (true);

-- Create policies for property owners
CREATE POLICY "Enable update for property owners"
ON properties
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners
    WHERE property_id = properties.id
  )
);

-- Create policies for unit owners
CREATE POLICY "Enable update for unit owners"
ON units
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners
    WHERE property_id = units.property_id
  )
); 
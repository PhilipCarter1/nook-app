-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Property owners can manage their properties"
ON properties FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners WHERE property_id = properties.id
  )
);

CREATE POLICY "Property managers can view assigned properties"
ON properties FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM property_managers WHERE property_id = properties.id
  )
);

-- Units policies
CREATE POLICY "Property owners can manage their units"
ON units FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners WHERE property_id = units.property_id
  )
);

CREATE POLICY "Tenants can view their assigned units"
ON units FOR SELECT
USING (
  auth.uid() IN (
    SELECT tenant_id FROM unit_tenants WHERE unit_id = units.id
  )
);

-- Maintenance tickets policies
CREATE POLICY "Tenants can create and view their tickets"
ON maintenance_tickets FOR ALL
USING (auth.uid() = tenant_id);

CREATE POLICY "Property owners can manage their property tickets"
ON maintenance_tickets FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners WHERE property_id = maintenance_tickets.property_id
  )
);

CREATE POLICY "Vendors can view assigned tickets"
ON maintenance_tickets FOR SELECT
USING (auth.uid() = assigned_to);

-- Maintenance comments policies
CREATE POLICY "Users can view comments on their tickets"
ON maintenance_comments FOR SELECT
USING (
  auth.uid() IN (
    SELECT tenant_id FROM maintenance_tickets WHERE id = maintenance_comments.ticket_id
    UNION
    SELECT user_id FROM property_owners WHERE property_id IN (
      SELECT property_id FROM maintenance_tickets WHERE id = maintenance_comments.ticket_id
    )
  )
);

CREATE POLICY "Users can create comments on their tickets"
ON maintenance_comments FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT tenant_id FROM maintenance_tickets WHERE id = maintenance_comments.ticket_id
    UNION
    SELECT user_id FROM property_owners WHERE property_id IN (
      SELECT property_id FROM maintenance_tickets WHERE id = maintenance_comments.ticket_id
    )
  )
);

-- Documents policies
CREATE POLICY "Users can view their documents"
ON documents FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM document_access WHERE document_id = documents.id
  )
);

CREATE POLICY "Property owners can manage their documents"
ON documents FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners WHERE property_id = documents.property_id
  )
);

-- Vendors policies
CREATE POLICY "Vendors can view their own data"
ON vendors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own data"
ON vendors FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view all vendors"
ON vendors FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM property_owners
  )
);

-- Organizations policies
CREATE POLICY "Organization members can view their organization"
ON organizations FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_members WHERE organization_id = organizations.id
  )
);

CREATE POLICY "Organization admins can manage their organization"
ON organizations FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE organization_id = organizations.id 
    AND role = 'admin'
  )
); 
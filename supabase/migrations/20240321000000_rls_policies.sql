-- Temporarily disable Row Level Security to prevent recursion errors
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE units ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Disable RLS on all tables for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Comment out all policies for now
-- Users policies
-- CREATE POLICY "Users can view their own data"
-- ON users FOR SELECT
-- USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own data"
-- ON users FOR UPDATE
-- USING (auth.uid() = id);

-- Properties policies - simplified to prevent recursion
-- CREATE POLICY "Users can view all properties"
-- ON properties FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can manage properties"
-- ON properties FOR ALL
-- USING (auth.uid() = owner_id);

-- Units policies - simplified
-- CREATE POLICY "Users can view all units"
-- ON units FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can manage units"
-- ON units FOR ALL
-- USING (auth.uid() = property_id);

-- Maintenance tickets policies - simplified
-- CREATE POLICY "Users can view all tickets"
-- ON maintenance_tickets FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can manage tickets"
-- ON maintenance_tickets FOR ALL
-- USING (auth.uid() = tenant_id OR auth.uid() = assigned_to);

-- Maintenance comments policies - simplified
-- CREATE POLICY "Users can view all comments"
-- ON maintenance_comments FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can create comments"
-- ON maintenance_comments FOR INSERT
-- WITH CHECK (auth.uid() = user_id);

-- Documents policies - simplified
-- CREATE POLICY "Users can view all documents"
-- ON documents FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can manage documents"
-- ON documents FOR ALL
-- USING (auth.uid() = user_id);

-- Vendors policies - simplified
-- CREATE POLICY "Users can view all vendors"
-- ON vendors FOR SELECT
-- USING (true);

-- CREATE POLICY "Vendors can manage their data"
-- ON vendors FOR ALL
-- USING (auth.uid() = user_id);

-- Organizations policies - simplified
-- CREATE POLICY "Users can view all organizations"
-- ON organizations FOR SELECT
-- USING (true);

-- CREATE POLICY "Organization admins can manage their organization"
-- ON organizations FOR ALL
-- USING (auth.uid() = owner_id); 
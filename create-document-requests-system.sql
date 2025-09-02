-- Document Requests System for Nook
-- This script creates tables and policies for landlords to request documents from tenants

-- Create document_requests table
CREATE TABLE IF NOT EXISTS public.document_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN (
    'lease_agreement',
    'id_verification',
    'income_proof',
    'employment_verification',
    'bank_statement',
    'credit_report',
    'rental_history',
    'references',
    'insurance_certificate',
    'pet_documentation',
    'emergency_contact',
    'other'
  )),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'expired')),
  due_date date,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  notes text
);

-- Create document_request_files table for uploaded documents
CREATE TABLE IF NOT EXISTS public.document_request_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES public.document_requests(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  uploaded_by uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_requests_property_id ON public.document_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_tenant_id ON public.document_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_landlord_id ON public.document_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status ON public.document_requests(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_due_date ON public.document_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_document_request_files_request_id ON public.document_request_files(request_id);

-- Enable RLS
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_request_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_requests
-- Landlords can see requests for their properties
CREATE POLICY "Landlords can view requests for their properties" ON public.document_requests
  FOR SELECT USING (
    landlord_id = auth.uid() OR
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  );

-- Landlords can create requests for their properties
CREATE POLICY "Landlords can create requests for their properties" ON public.document_requests
  FOR INSERT WITH CHECK (
    landlord_id = auth.uid() AND
    property_id IN (
      SELECT id FROM public.properties WHERE landlord_id = auth.uid()
    )
  );

-- Landlords can update requests they created
CREATE POLICY "Landlords can update their requests" ON public.document_requests
  FOR UPDATE USING (landlord_id = auth.uid());

-- Landlords can delete requests they created
CREATE POLICY "Landlords can delete their requests" ON public.document_requests
  FOR DELETE USING (landlord_id = auth.uid());

-- Tenants can view requests for them
CREATE POLICY "Tenants can view their requests" ON public.document_requests
  FOR SELECT USING (tenant_id = auth.uid());

-- Tenants can update requests assigned to them (submit documents)
CREATE POLICY "Tenants can update their requests" ON public.document_requests
  FOR UPDATE USING (tenant_id = auth.uid());

-- RLS Policies for document_request_files
-- Users can view files for requests they have access to
CREATE POLICY "Users can view files for accessible requests" ON public.document_request_files
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM public.document_requests WHERE 
        landlord_id = auth.uid() OR tenant_id = auth.uid()
    )
  );

-- Users can upload files for requests they have access to
CREATE POLICY "Users can upload files for accessible requests" ON public.document_request_files
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    request_id IN (
      SELECT id FROM public.document_requests WHERE 
        landlord_id = auth.uid() OR tenant_id = auth.uid()
    )
  );

-- Users can delete files they uploaded
CREATE POLICY "Users can delete their uploaded files" ON public.document_request_files
  FOR DELETE USING (uploaded_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_document_requests_updated_at
  BEFORE UPDATE ON public.document_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_document_requests_updated_at();

-- Insert some common document types for reference
INSERT INTO public.document_requests (id, property_id, tenant_id, landlord_id, document_type, title, description, status, due_date, priority)
SELECT 
  uuid_generate_v4(),
  p.id,
  t.id,
  p.landlord_id,
  'lease_agreement',
  'Lease Agreement',
  'Please upload a signed copy of your lease agreement',
  'pending',
  CURRENT_DATE + INTERVAL '7 days',
  'high'
FROM public.properties p
JOIN public.tenants t ON t.property_id = p.id
WHERE p.landlord_id IS NOT NULL
LIMIT 0; -- This will insert 0 rows, just showing the structure

-- Grant necessary permissions
GRANT ALL ON public.document_requests TO authenticated;
GRANT ALL ON public.document_request_files TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

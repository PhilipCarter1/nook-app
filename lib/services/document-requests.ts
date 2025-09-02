import { createClient } from '@/lib/supabase/client';

export interface DocumentRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  document_type: string;
  title: string;
  description?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  due_date?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  notes?: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
  property?: {
    id: string;
    name: string;
    address: string;
  };
  files?: DocumentRequestFile[];
}

export interface DocumentRequestFile {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateDocumentRequestData {
  property_id: string;
  tenant_id: string;
  document_type: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

const supabase = createClient();

// Get all document requests for a landlord
export async function getLandlordDocumentRequests(landlordId: string): Promise<{
  success: boolean;
  data?: DocumentRequest[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('document_requests')
      .select(`
        *,
        tenant:tenants(id, name, email),
        property:properties(id, name, address)
      `)
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching landlord document requests:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getLandlordDocumentRequests:', error);
    return { success: false, error: 'Failed to fetch document requests' };
  }
}

// Get all document requests for a tenant
export async function getTenantDocumentRequests(tenantId: string): Promise<{
  success: boolean;
  data?: DocumentRequest[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('document_requests')
      .select(`
        *,
        property:properties(id, name, address),
        files:document_request_files(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenant document requests:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getTenantDocumentRequests:', error);
    return { success: false, error: 'Failed to fetch document requests' };
  }
}

// Create a new document request
export async function createDocumentRequest(requestData: CreateDocumentRequestData): Promise<{
  success: boolean;
  data?: DocumentRequest;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('document_requests')
      .insert({
        ...requestData,
        landlord_id: user.id,
        status: 'pending'
      })
      .select(`
        *,
        tenant:tenants(id, name, email),
        property:properties(id, name, address)
      `)
      .single();

    if (error) {
      console.error('Error creating document request:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createDocumentRequest:', error);
    return { success: false, error: 'Failed to create document request' };
  }
}

// Update document request status
export async function updateDocumentRequestStatus(
  requestId: string, 
  status: DocumentRequest['status'],
  notes?: string
): Promise<{
  success: boolean;
  data?: DocumentRequest;
  error?: string;
}> {
  try {
    const updateData: any = { status };
    
    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    } else if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('document_requests')
      .update(updateData)
      .eq('id', requestId)
      .select(`
        *,
        tenant:tenants(id, name, email),
        property:properties(id, name, address)
      `)
      .single();

    if (error) {
      console.error('Error updating document request status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateDocumentRequestStatus:', error);
    return { success: false, error: 'Failed to update document request' };
  }
}

// Upload file for document request
export async function uploadDocumentRequestFile(
  requestId: string,
  file: File
): Promise<{
  success: boolean;
  data?: DocumentRequestFile;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${requestId}/${Date.now()}.${fileExt}`;
    const filePath = `document-requests/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Save file record to database
    const { data, error } = await supabase
      .from('document_request_files')
      .insert({
        request_id: requestId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving file record:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in uploadDocumentRequestFile:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

// Get document request files
export async function getDocumentRequestFiles(requestId: string): Promise<{
  success: boolean;
  data?: DocumentRequestFile[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('document_request_files')
      .select('*')
      .eq('request_id', requestId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching document request files:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getDocumentRequestFiles:', error);
    return { success: false, error: 'Failed to fetch files' };
  }
}

// Delete document request file
export async function deleteDocumentRequestFile(fileId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from('document_request_files')
      .select('*')
      .eq('id', fileId)
      .eq('uploaded_by', user.id)
      .single();

    if (fetchError || !fileData) {
      return { success: false, error: 'File not found or access denied' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([fileData.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('document_request_files')
      .delete()
      .eq('id', fileId);

    if (deleteError) {
      console.error('Error deleting file record:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteDocumentRequestFile:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}

// Get document request by ID
export async function getDocumentRequest(requestId: string): Promise<{
  success: boolean;
  data?: DocumentRequest;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('document_requests')
      .select(`
        *,
        tenant:tenants(id, name, email),
        property:properties(id, name, address),
        files:document_request_files(*)
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('Error fetching document request:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getDocumentRequest:', error);
    return { success: false, error: 'Failed to fetch document request' };
  }
}

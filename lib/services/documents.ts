import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Document {
  id: string;
  tenantId: string;
  type: 'lease' | 'application' | 'id_verification' | 'income_proof' | 'references' | 'proof_of_address' | 'other';
  name: string;
  url: string;
  version: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  metadata: {
    size: number;
    mimeType: string;
    pages?: number;
    expirationDate?: string;
    tags?: string[];
    category?: string;
  };
  tenantName: string;
  tenantEmail: string;
  propertyName: string;
  unitNumber: string;
  landlordId: string;
  landlordName: string;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  rejectionReason?: string;
  changeRequests?: string[];
}

export interface DocumentUploadRequest {
  tenantId: string;
  type: Document['type'];
  name: string;
  file: File;
  propertyId: string;
  unitId: string;
}

export interface DocumentApprovalRequest {
  documentId: string;
  reviewerId: string;
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
  rejectionReason?: string;
  changeRequests?: string[];
}

// Upload document for tenant
export async function uploadDocument(request: DocumentUploadRequest): Promise<{ success: boolean; documentId?: string; error?: string }> {
  const supabase = getClient();
  
  try {
    // Verify tenant has access to this property/unit
    const { data: tenantAccess, error: accessError } = await supabase
      .from('tenants')
      .select('id, user_id, property_id, unit_id')
      .eq('id', request.tenantId)
      .eq('property_id', request.propertyId)
      .eq('unit_id', request.unitId)
      .single();

    if (accessError || !tenantAccess) {
      return { success: false, error: 'Tenant does not have access to this property/unit' };
    }

    // Upload file to storage
    const fileName = `${request.tenantId}/${request.type}/${Date.now()}_${request.file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tenant-documents')
      .upload(fileName, request.file);

    if (uploadError) {
      return { success: false, error: 'Failed to upload file' };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tenant-documents')
      .getPublicUrl(fileName);

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        tenant_id: request.tenantId,
        type: request.type,
        name: request.name,
        url: publicUrl,
        version: 1,
        status: 'pending',
        metadata: {
          size: request.file.size,
          mimeType: request.file.type,
          uploadedAt: new Date().toISOString()
        },
        property_id: request.propertyId,
        unit_id: request.unitId
      })
      .select()
      .single();

    if (docError) {
      return { success: false, error: 'Failed to create document record' };
    }

    return { success: true, documentId: document.id };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get documents pending approval for a landlord
export async function getPendingDocuments(landlordId: string): Promise<{ success: boolean; documents?: Document[]; error?: string }> {
  const supabase = getClient();
  
  try {
    // Get properties owned by this landlord
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('landlord_id', landlordId);

    if (propertiesError) {
      return { success: false, error: 'Failed to fetch properties' };
    }

    const propertyIds = properties?.map((p: any) => p.id) || [];

    // Get pending documents for these properties
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        *,
        tenants!inner(
          id,
          user_id,
          property_id,
          unit_id,
          users!inner(
            first_name,
            last_name,
            email
          )
        ),
        properties!inner(
          id,
          name
        ),
        units!inner(
          id,
          unit_number
        )
      `)
      .in('property_id', propertyIds)
      .eq('status', 'pending')
      .order('uploaded_at', { ascending: false });

    if (docsError) {
      return { success: false, error: 'Failed to fetch documents' };
    }

    // Transform data to match our interface
    const transformedDocuments: Document[] = (documents || []).map((doc: any) => ({
      id: doc.id,
      tenantId: doc.tenants.user_id,
      type: doc.type,
      name: doc.name,
      url: doc.url,
      version: doc.version,
      status: doc.status,
      metadata: doc.metadata,
      tenantName: `${doc.tenants.users.first_name} ${doc.tenants.users.last_name}`,
      tenantEmail: doc.tenants.users.email,
      propertyName: doc.properties.name,
      unitNumber: doc.units.unit_number,
      landlordId: landlordId,
      landlordName: 'Current User', // Will be filled from context
      uploadedAt: doc.uploaded_at,
      notes: doc.notes,
      rejectionReason: doc.rejection_reason,
      changeRequests: doc.change_requests
    }));

    return { success: true, documents: transformedDocuments };
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Approve a document
export async function approveDocument(documentId: string, reviewerId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', documentId);

    if (error) {
      return { success: false, error: 'Failed to approve document' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error approving document:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Reject a document
export async function rejectDocument(documentId: string, reviewerId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', documentId);

    if (error) {
      return { success: false, error: 'Failed to reject document' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error rejecting document:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Request changes on a document
export async function requestDocumentChanges(documentId: string, reviewerId: string, changes: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        status: 'pending',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        change_requests: changes
      })
      .eq('id', documentId);

    if (error) {
      return { success: false, error: 'Failed to request changes' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error requesting document changes:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get document details for review
export async function getDocumentDetails(documentId: string): Promise<{ success: boolean; document?: Document; error?: string }> {
  const supabase = getClient();
  
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        tenants!inner(
          id,
          user_id,
          property_id,
          unit_id,
          users!inner(
            first_name,
            last_name,
            email
          )
        ),
        properties!inner(
          id,
          name
        ),
        units!inner(
          id,
          unit_number
        )
      `)
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return { success: false, error: 'Document not found' };
    }

    const transformedDocument: Document = {
      id: document.id,
      tenantId: document.tenants.user_id,
      type: document.type,
      name: document.name,
      url: document.url,
      version: document.version,
      status: document.status,
      metadata: document.metadata,
      tenantName: `${document.tenants.users.first_name} ${document.tenants.users.last_name}`,
      tenantEmail: document.tenants.users.email,
      propertyName: document.properties.name,
      unitNumber: document.units.unit_number,
      landlordId: 'current-user', // Will be filled from context
      landlordName: 'Current User',
      uploadedAt: document.uploaded_at,
      notes: document.notes,
      rejectionReason: document.rejection_reason,
      changeRequests: document.change_requests
    };

    return { success: true, document: transformedDocument };
  } catch (error) {
    console.error('Error fetching document details:', error);
    return { success: false, error: 'Internal server error' };
  }
} 
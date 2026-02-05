import { getClient } from '@/lib/supabase/client';

export interface SignatureRequest {
  id: string;
  documentId: string;
  signerId: string;
  status: 'pending' | 'signed' | 'expired' | 'declined';
  type: 'landlord' | 'tenant';
  signatureData?: {
    signedAt: string;
    ipAddress: string;
    userAgent: string;
    signatureImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateSignatureRequestParams {
  documentId: string;
  signerId: string;
  type: 'landlord' | 'tenant';
  expiresInDays?: number;
}

export async function createSignatureRequest(params: CreateSignatureRequestParams): Promise<SignatureRequest> {
  const supabase = getClient();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays || 7));

  const { data: request, error } = await supabase
    .from('signature_requests')
    .insert({
      document_id: params.documentId,
      signer_id: params.signerId,
      type: params.type,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification to signer
  await supabase.functions.invoke('send-notification', {
    body: {
      userId: params.signerId,
      type: 'signature_request',
      title: 'Document Signature Required',
      message: 'You have a document that requires your signature',
      data: {
        documentId: params.documentId,
        requestId: request.id,
      },
    },
  });

  return request;
}

export async function getSignatureRequest(requestId: string): Promise<SignatureRequest> {
  const supabase = getClient();

  const { data: request, error } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) throw error;
  return request;
}

export async function getDocumentSignatureRequests(documentId: string): Promise<SignatureRequest[]> {
  const supabase = getClient();

  const { data: requests, error } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return requests;
}

export async function signDocument(requestId: string, signatureImage?: string): Promise<SignatureRequest> {
  const supabase = getClient();

  // Get request details
  const { data: request, error: fetchError } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError) throw fetchError;

  // Check if request is expired
  if (new Date(request.expiresAt) < new Date()) {
    throw new Error('Signature request has expired');
  }

  // Update signature request
  const { data: updatedRequest, error: updateError } = await supabase
    .from('signature_requests')
    .update({
      status: 'signed',
      signature_data: {
        signedAt: new Date().toISOString(),
        ipAddress: '', // Will be set by the client
        userAgent: '', // Will be set by the client
        signatureImage,
      },
    })
    .eq('id', requestId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Check if all required signatures are complete
  const { data: allRequests } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('document_id', request.documentId);

  const allSigned = allRequests?.every((r: any) => r.status === 'signed');

  if (allSigned) {
    // Update document status
    await supabase
      .from('documents')
      .update({ status: 'signed' })
      .eq('id', request.documentId);

    // Notify all parties
    const { data: document } = await supabase
      .from('documents')
      .select('property_id, tenant_id')
      .eq('id', request.documentId)
      .single();

    if (document) {
      await Promise.all([
        supabase.functions.invoke('send-notification', {
          body: {
            propertyId: document.property_id,
            type: 'document_signed',
            title: 'Document Fully Signed',
            message: 'All parties have signed the document',
          },
        }),
        supabase.functions.invoke('send-notification', {
          body: {
            userId: document.tenant_id,
            type: 'document_signed',
            title: 'Document Fully Signed',
            message: 'All parties have signed the document',
          },
        }),
      ]);
    }
  }

  return updatedRequest;
}

export async function declineSignature(requestId: string, reason: string): Promise<SignatureRequest> {
  const supabase = getClient();

  const { data: request, error } = await supabase
    .from('signature_requests')
    .update({
      status: 'declined',
      signature_data: {
        declinedAt: new Date().toISOString(),
        declineReason: reason,
      },
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Notify document owner
  const { data: document } = await supabase
    .from('documents')
    .select('property_id')
    .eq('id', request.documentId)
    .single();

  if (document) {
    await supabase.functions.invoke('send-notification', {
      body: {
        propertyId: document.property_id,
        type: 'signature_declined',
        title: 'Signature Declined',
        message: `Document signature was declined: ${reason}`,
      },
    });
  }

  return request;
}

export async function resendSignatureRequest(requestId: string): Promise<SignatureRequest> {
  const supabase = getClient();

  // Get current request
  const { data: currentRequest, error: fetchError } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError) throw fetchError;

  // Create new request
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: newRequest, error: createError } = await supabase
    .from('signature_requests')
    .insert({
      document_id: currentRequest.documentId,
      signer_id: currentRequest.signerId,
      type: currentRequest.type,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (createError) throw createError;

  // Update old request
  await supabase
    .from('signature_requests')
    .update({ status: 'expired' })
    .eq('id', requestId);

  // Send notification
  await supabase.functions.invoke('send-notification', {
    body: {
      userId: currentRequest.signerId,
      type: 'signature_request',
      title: 'Document Signature Required',
      message: 'You have a document that requires your signature',
      data: {
        documentId: currentRequest.documentId,
        requestId: newRequest.id,
      },
    },
  });

  return newRequest;
} 
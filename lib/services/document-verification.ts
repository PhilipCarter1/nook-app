import { getClient } from '@/lib/supabase/client';

export interface VerificationResult {
  id: string;
  documentId: string;
  status: 'pending' | 'verified' | 'failed';
  type: 'identity' | 'income' | 'employment' | 'rental_history' | 'other';
  details: {
    verifiedFields: string[];
    failedFields: string[];
    confidence: number;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface VerificationRequest {
  documentId: string;
  type: 'identity' | 'income' | 'employment' | 'rental_history' | 'other';
  expectedFields?: string[];
}

export async function initiateVerification(request: VerificationRequest): Promise<VerificationResult> {
  const supabase = getClient();

  // Create initial record
  const { data: verification, error: createError } = await supabase
    .from('document_verifications')
    .insert({
      document_id: request.documentId,
      type: request.type,
      status: 'pending',
      details: {
        verifiedFields: [],
        failedFields: [],
        confidence: 0,
      },
    })
    .select()
    .single();

  if (createError) throw createError;

  // Get document details
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', request.documentId)
    .single();

  if (docError) throw docError;

  // Call verification service
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOCUMENT_VERIFICATION_API_KEY}`,
      },
      body: JSON.stringify({
        verificationId: verification.id,
        documentUrl: document.url,
        type: request.type,
        expectedFields: request.expectedFields,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate document verification');
    }

    return verification;
  } catch (error) {
    // Update status to failed
    await supabase
      .from('document_verifications')
      .update({ 
        status: 'failed',
        details: {
          verifiedFields: [],
          failedFields: ['verification_initiation'],
          confidence: 0,
          notes: 'Failed to initiate verification process',
        },
      })
      .eq('id', verification.id);

    throw error;
  }
}

export async function getVerificationResult(verificationId: string): Promise<VerificationResult> {
  const supabase = getClient();

  const { data: verification, error } = await supabase
    .from('document_verifications')
    .select('*')
    .eq('id', verificationId)
    .single();

  if (error) throw error;
  return verification;
}

export async function getDocumentVerifications(documentId: string): Promise<VerificationResult[]> {
  const supabase = getClient();

  const { data: verifications, error } = await supabase
    .from('document_verifications')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return verifications;
}

// Webhook handler for verification service updates
export async function handleVerificationWebhook(payload: any): Promise<void> {
  const supabase = getClient();
  const { verificationId, status, results } = payload;

  const updates: Partial<VerificationResult> = {
    status: status === 'completed' ? 'verified' : 'failed',
    updatedAt: new Date().toISOString(),
  };

  if (status === 'completed') {
    updates.completedAt = new Date().toISOString();
    updates.details = {
      verifiedFields: results.verifiedFields || [],
      failedFields: results.failedFields || [],
      confidence: results.confidence || 0,
      notes: results.notes,
    };
  }

  const { error } = await supabase
    .from('document_verifications')
    .update(updates)
    .eq('id', verificationId);

  if (error) throw error;

  // Get document details for notification
  const { data: verification } = await supabase
    .from('document_verifications')
    .select('document_id')
    .eq('id', verificationId)
    .single();

  if (verification) {
    const { data: document } = await supabase
      .from('documents')
      .select('property_id, tenant_id')
      .eq('id', verification.document_id)
      .single();

    if (document) {
      // Notify relevant parties
      await Promise.all([
        supabase.functions.invoke('send-notification', {
          body: {
            propertyId: document.property_id,
            type: 'document_verification',
            title: 'Document Verification Update',
            message: `Document verification ${status === 'completed' ? 'completed' : 'failed'}`,
          },
        }),
        supabase.functions.invoke('send-notification', {
          body: {
            userId: document.tenant_id,
            type: 'document_verification',
            title: 'Document Verification Update',
            message: `Document verification ${status === 'completed' ? 'completed' : 'failed'}`,
          },
        }),
      ]);
    }
  }
}

export async function retryVerification(verificationId: string): Promise<VerificationResult> {
  const supabase = getClient();

  // Get current verification
  const { data: currentVerification, error: fetchError } = await supabase
    .from('document_verifications')
    .select('*')
    .eq('id', verificationId)
    .single();

  if (fetchError) throw fetchError;

  // Create new verification request
  const { data: newVerification, error: createError } = await supabase
    .from('document_verifications')
    .insert({
      document_id: currentVerification.documentId,
      type: currentVerification.type,
      status: 'pending',
      details: {
        verifiedFields: [],
        failedFields: [],
        confidence: 0,
      },
    })
    .select()
    .single();

  if (createError) throw createError;

  // Get document details
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', currentVerification.documentId)
    .single();

  if (!document) throw new Error('Document not found');

  // Call verification service
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOCUMENT_VERIFICATION_API_KEY}`,
      },
      body: JSON.stringify({
        verificationId: newVerification.id,
        documentUrl: document.url,
        type: currentVerification.type,
        expectedFields: currentVerification.details.verifiedFields,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate document verification');
    }

    return newVerification;
  } catch (error) {
    // Update status to failed
    await supabase
      .from('document_verifications')
      .update({ 
        status: 'failed',
        details: {
          verifiedFields: [],
          failedFields: ['verification_initiation'],
          confidence: 0,
          notes: 'Failed to initiate verification process',
        },
      })
      .eq('id', newVerification.id);

    throw error;
  }
} 
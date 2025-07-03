import { getClient } from '@/lib/supabase/client';

export interface BackgroundCheckResult {
  id: string;
  tenantId: string;
  propertyId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  criminalCheck: {
    status: 'clear' | 'found' | 'pending';
    details?: string;
  };
  creditCheck: {
    score?: number;
    status: 'approved' | 'rejected' | 'pending';
    details?: string;
  };
  employmentVerification: {
    status: 'verified' | 'unverified' | 'pending';
    details?: string;
  };
  rentalHistory: {
    status: 'verified' | 'unverified' | 'pending';
    details?: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BackgroundCheckRequest {
  tenantId: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn?: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  employmentInfo?: {
    employer: string;
    position: string;
    income: number;
    startDate: string;
  };
  previousAddresses?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    startDate: string;
    endDate: string;
  }[];
}

export async function initiateBackgroundCheck(request: BackgroundCheckRequest): Promise<BackgroundCheckResult> {
  const supabase = getClient();

  // Create initial record
  const { data: check, error: createError } = await supabase
    .from('background_checks')
    .insert({
      tenant_id: request.tenantId,
      property_id: request.propertyId,
      status: 'pending',
      criminal_check: { status: 'pending' },
      credit_check: { status: 'pending' },
      employment_verification: { status: 'pending' },
      rental_history: { status: 'pending' },
    })
    .select()
    .single();

  if (createError) throw createError;

  // Call background check provider API
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/background-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKGROUND_CHECK_API_KEY}`,
      },
      body: JSON.stringify({
        checkId: check.id,
        ...request,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate background check');
    }

    // Update status to in_progress
    const { error: updateError } = await supabase
      .from('background_checks')
      .update({ status: 'in_progress' })
      .eq('id', check.id);

    if (updateError) throw updateError;

    return check;
  } catch (error) {
    // Update status to failed
    await supabase
      .from('background_checks')
      .update({ 
        status: 'failed',
        credit_check: { status: 'pending', details: 'Failed to initiate check' }
      })
      .eq('id', check.id);

    throw error;
  }
}

export async function getBackgroundCheck(checkId: string): Promise<BackgroundCheckResult> {
  const supabase = getClient();

  const { data: check, error } = await supabase
    .from('background_checks')
    .select('*')
    .eq('id', checkId)
    .single();

  if (error) throw error;
  return check;
}

export async function getTenantBackgroundChecks(tenantId: string): Promise<BackgroundCheckResult[]> {
  const supabase = getClient();

  const { data: checks, error } = await supabase
    .from('background_checks')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return checks;
}

export async function getPropertyBackgroundChecks(id: string): Promise<BackgroundCheckResult[]> {
  const supabase = getClient();

  const { data: checks, error } = await supabase
    .from('background_checks')
    .select('*')
    .eq('property_id', id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return checks;
}

// Webhook handler for background check provider updates
export async function handleBackgroundCheckWebhook(payload: any): Promise<void> {
  const supabase = getClient();
  const { checkId, status, results } = payload;

  const updates: Partial<BackgroundCheckResult> = {
    status: status === 'completed' ? 'completed' : 'in_progress',
    updatedAt: new Date().toISOString(),
  };

  if (status === 'completed') {
    updates.completedAt = new Date().toISOString();
    updates.criminalCheck = results.criminalCheck;
    updates.creditCheck = results.creditCheck;
    updates.employmentVerification = results.employmentVerification;
    updates.rentalHistory = results.rentalHistory;
  }

  const { error } = await supabase
    .from('background_checks')
    .update(updates)
    .eq('id', checkId);

  if (error) throw error;

  // Notify relevant parties
  const { data: check } = await supabase
    .from('background_checks')
    .select('tenant_id, property_id')
    .eq('id', checkId)
    .single();

  if (check) {
    // Send notifications to tenant and landlord
    await Promise.all([
      supabase.functions.invoke('send-notification', {
        body: {
          userId: check.tenant_id,
          type: 'background_check_update',
          title: 'Background Check Update',
          message: `Your background check is ${status}`,
        },
      }),
      supabase.functions.invoke('send-notification', {
        body: {
          propertyId: check.property_id,
          type: 'background_check_update',
          title: 'Background Check Update',
          message: `Background check for tenant is ${status}`,
        },
      }),
    ]);
  }
} 
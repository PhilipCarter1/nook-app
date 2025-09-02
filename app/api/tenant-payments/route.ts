import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTenantPaymentInfo } from '@/lib/services/property-payments';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const tenantId = searchParams.get('tenantId') || user.id;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const result = await getTenantPaymentInfo(propertyId, tenantId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in tenant payments GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

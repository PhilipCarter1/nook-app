import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getPropertyPaymentMethods,
  addPropertyPaymentMethod,
  updatePropertyPaymentMethod,
  deletePropertyPaymentMethod,
  getPropertyPaymentSettings,
  updatePropertyPaymentSettings,
  getPropertyRentSplits,
  addRentSplit,
  updateRentSplit,
  deleteRentSplit
} from '@/lib/services/property-payments';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const type = searchParams.get('type');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    switch (type) {
      case 'payment-methods':
        const methodsResult = await getPropertyPaymentMethods(propertyId);
        return NextResponse.json(methodsResult);

      case 'payment-settings':
        const settingsResult = await getPropertyPaymentSettings(propertyId);
        return NextResponse.json(settingsResult);

      case 'rent-splits':
        const splitsResult = await getPropertyRentSplits(propertyId);
        return NextResponse.json(splitsResult);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in property payments GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, propertyId, data } = body;

    if (!type || !propertyId) {
      return NextResponse.json({ error: 'Type and propertyId are required' }, { status: 400 });
    }

    switch (type) {
      case 'payment-method':
        const methodResult = await addPropertyPaymentMethod(propertyId, data);
        return NextResponse.json(methodResult);

      case 'payment-settings':
        const settingsResult = await updatePropertyPaymentSettings(propertyId, data);
        return NextResponse.json(settingsResult);

      case 'rent-split':
        const splitResult = await addRentSplit(propertyId, data.tenantId, data.splitAmount, data.splitPercentage);
        return NextResponse.json(splitResult);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in property payments POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and id are required' }, { status: 400 });
    }

    switch (type) {
      case 'payment-method':
        const methodResult = await updatePropertyPaymentMethod(id, data);
        return NextResponse.json(methodResult);

      case 'rent-split':
        const splitResult = await updateRentSplit(id, data);
        return NextResponse.json(splitResult);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in property payments PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and id are required' }, { status: 400 });
    }

    switch (type) {
      case 'payment-method':
        const methodResult = await deletePropertyPaymentMethod(id);
        return NextResponse.json(methodResult);

      case 'rent-split':
        const splitResult = await deleteRentSplit(id);
        return NextResponse.json(splitResult);

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in property payments DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

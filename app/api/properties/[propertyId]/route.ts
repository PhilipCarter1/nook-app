import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const propertySchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  units: z.number().positive(),
  status: z.enum(['active', 'inactive']),
});

export async function PATCH(
  req: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = propertySchema.parse(body);

    const { data: property, error } = await db
      .from('properties')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.propertyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    console.error('[PROPERTY_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { error: deleteError } = await db
      .from('properties')
      .delete()
      .eq('id', params.propertyId)
      .eq('user_id', userId);

    if (deleteError) {
      return new NextResponse('Internal Error', { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PROPERTY_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: property, error } = await db
      .from('properties')
      .select('*')
      .eq('id', params.propertyId)
      .eq('user_id', userId)
      .single();

    if (error || !property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('[PROPERTY_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = propertySchema.parse(body);

    const { data: property, error } = await db
      .from('properties')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.propertyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !property) {
      return new NextResponse('Property not found', { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    console.error('[PROPERTY_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
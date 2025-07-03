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

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: userProperties, error } = await db
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PROPERTIES_GET]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(userProperties || []);
  } catch (error) {
    console.error('[PROPERTIES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = propertySchema.parse(body);

    const { data: property, error } = await db
      .from('properties')
      .insert({
        ...validatedData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[PROPERTIES_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    console.error('[PROPERTIES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 
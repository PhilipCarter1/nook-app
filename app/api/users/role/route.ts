import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { log } from '@/lib/logger';
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string; role?: string };
    const { userId, role } = body;
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Update user role
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Error updating user role:', { message, error: err });
    return NextResponse.json({ error: message || 'Failed to update user role' }, { status: 500 });
  }
}
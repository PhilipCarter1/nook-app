import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { log } from '@/lib/logger';
export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Update user role
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error('Error updating user role:', error as Error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
} 
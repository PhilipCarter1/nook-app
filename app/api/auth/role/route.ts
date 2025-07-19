import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { log } from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update user's role in the database
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', session.user.id);

    if (error) {
      log.error('Error updating role:', error as Error);
      return new NextResponse('Error updating role', { status: 500 });
    }

    return new NextResponse('Role updated successfully', { status: 200 });
  } catch (error) {
    log.error('Error in role update:', error as Error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
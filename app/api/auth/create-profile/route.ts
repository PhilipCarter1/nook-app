import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

// Create a service role client (backend-only, uses service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      role?: string;
    };
    const { id, email, first_name, last_name, role } = body;

    // Validate required fields
    if (!id || !email || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    log.info('Creating user profile', { id, email, first_name, last_name, role });

    // Create user profile in the users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id,
          email,
          name: `${first_name} ${last_name}`,
          role: role || 'tenant',
          password: 'auth-user', // Placeholder - actual auth handled by Supabase Auth
        },
      ])
      .select();

    if (error) {
      log.error('Error creating user profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log.info('User profile created successfully', { data });

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Unexpected error creating profile:', err as Error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

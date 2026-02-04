import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
    const body = await request.json();
    const { id, email, first_name, last_name, role } = body;

    // Validate required fields
    if (!id || !email || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating user profile for:', { id, email, first_name, last_name, role });

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
      console.error('Error creating user profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ User profile created successfully:', data);

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error creating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

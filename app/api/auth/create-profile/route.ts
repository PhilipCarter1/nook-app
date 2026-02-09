import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/resend';

// Use admin client factory for service role operations
const supabaseAdmin = createAdminClient();

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

    // Upsert user profile: update if exists (from trigger), insert if not
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        [
          {
            id,
            email,
            first_name,
            last_name,
            role: role || 'tenant',
          },
        ],
        { onConflict: 'id' }
      )
      .select();

    if (error) {
      log.error('Error creating user profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log.info('User profile created successfully', { data });

    // Send optional welcome email via Resend (best-effort)
    try {
      if (process.env.RESEND_API_KEY) {
        await sendWelcomeEmail(email, `${first_name} ${last_name}`);
      }
    } catch (emailErr) {
      log.error('Failed to send welcome email:', emailErr instanceof Error ? emailErr : new Error(String(emailErr)));
    }

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

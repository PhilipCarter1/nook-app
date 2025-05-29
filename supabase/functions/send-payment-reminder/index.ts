import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tenantId, propertyId, amount, dueDate } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get tenant and property details
    const { data: tenant, error: tenantError } = await supabaseClient
      .from('users')
      .select('email, full_name')
      .eq('id', tenantId)
      .single();

    if (tenantError) throw tenantError;

    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('name, address')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Nook <noreply@nook.com>',
      to: tenant.email,
      subject: 'Rent Payment Reminder',
      html: `
        <h1>Rent Payment Reminder</h1>
        <p>Dear ${tenant.full_name},</p>
        <p>This is a reminder that your rent payment of $${amount} for ${property.name} is due on ${new Date(dueDate).toLocaleDateString()}.</p>
        <p>Property Address: ${property.address}</p>
        <p>Please make your payment as soon as possible to avoid any late fees.</p>
        <p>You can make your payment by logging into your Nook account.</p>
        <p>Best regards,<br>The Nook Team</p>
      `,
    });

    if (emailError) throw emailError;

    // Create notification record
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: tenantId,
        type: 'payment_reminder',
        title: 'Rent Payment Reminder',
        message: `Your rent payment of $${amount} is due on ${new Date(dueDate).toLocaleDateString()}`,
        data: {
          propertyId,
          amount,
          dueDate,
        },
      });

    if (notificationError) throw notificationError;

    return new Response(
      JSON.stringify({ success: true, emailData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 
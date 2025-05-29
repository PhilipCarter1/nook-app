import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { propertyId, month } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get property details
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('name, address, landlord:users(full_name, email)')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Get rent splits and payments
    const { data: rentSplits, error: splitsError } = await supabaseClient
      .from('rent_splits')
      .select(`
        *,
        tenant:users (
          full_name,
          email
        ),
        payments (
          amount,
          status,
          paid_date
        )
      `)
      .eq('property_id', propertyId);

    if (splitsError) throw splitsError;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add header
    page.drawText('Rent Payment Report', {
      x: 50,
      y: 800,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Add property details
    page.drawText(`Property: ${property.name}`, {
      x: 50,
      y: 770,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Address: ${property.address}`, {
      x: 50,
      y: 750,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Month: ${month}`, {
      x: 50,
      y: 730,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add tenant payment details
    let yOffset = 680;
    rentSplits.forEach((split) => {
      const totalPaid = split.payments.reduce((sum, payment) => {
        return sum + (payment.status === 'completed' ? payment.amount : 0);
      }, 0);

      page.drawText(`Tenant: ${split.tenant.full_name}`, {
        x: 50,
        y: yOffset,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Share: ${split.share_percentage}%`, {
        x: 50,
        y: yOffset - 20,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Amount Paid: $${totalPaid}`, {
        x: 50,
        y: yOffset - 40,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yOffset -= 80;
    });

    // Add summary
    const totalAmount = rentSplits.reduce((sum, split) => {
      return sum + split.payments.reduce((paymentSum, payment) => {
        return paymentSum + (payment.status === 'completed' ? payment.amount : 0);
      }, 0);
    }, 0);

    page.drawText('Summary', {
      x: 50,
      y: yOffset - 20,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Total Amount Collected: $${totalAmount}`, {
      x: 50,
      y: yOffset - 40,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rent-report-${month}.pdf"`,
      },
      status: 200,
    });
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
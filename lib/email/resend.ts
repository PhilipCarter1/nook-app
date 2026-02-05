import fetch from 'node-fetch';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  // We don't throw here to allow environments without Resend configured
}

export async function sendWelcomeEmail(to: string, name?: string) {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not configured' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@localhost',
        to: to,
        subject: `Welcome to Nook${name ? `, ${name}` : ''}`,
        html: `<p>Hi ${name || ''},</p><p>Welcome to Nook! Your account has been created. Please sign in to continue.</p><p>— The Nook Team</p>`,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, status: res.status, body: text };
    }

    const json = await res.json();
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

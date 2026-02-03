// Mock Resend for preview
class MockResend {
  emails = {
    send: async () => ({ id: 'mock-email-id' }),
  };
}

// Use real Resend in production, mock in development
const Resend = process.env.NODE_ENV === 'production'
  ? require('resend').Resend
  : MockResend;

// The project historically used `SENDGRID_API_KEY` env var name for email keys.
// We keep that env var name but use it as the Resend API key per your request.
const RESEND_KEY = process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY;

if (!RESEND_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('SENDGRID_API_KEY (used for Resend) is not set');
}

export const resend = new Resend(RESEND_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'Nook <noreply@rentwithnook.com>',
    to: email,
    subject: 'Welcome to Nook!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Nook, ${name}!</h1>
        <p>We're excited to have you on board. Nook is your all-in-one property management solution.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your properties</li>
          <li>Invite your team members</li>
        </ul>
        <p>If you have any questions, our support team is here to help.</p>
        <p>Best regards,<br>The Nook Team</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(email: string, name: string, amount: number, date: string) {
  await resend.emails.send({
    from: 'Nook <noreply@rentwithnook.com>',
    to: email,
    subject: 'Payment Confirmation',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Confirmation</h1>
        <p>Dear ${name},</p>
        <p>We've received your payment of $${amount} on ${date}.</p>
        <p>Thank you for your prompt payment!</p>
        <p>Best regards,<br>The Nook Team</p>
      </div>
    `,
  });
}

export async function sendMaintenanceUpdateEmail(email: string, name: string, ticketId: string, status: string) {
  await resend.emails.send({
    from: 'Nook <noreply@rentwithnook.com>',
    to: email,
    subject: 'Maintenance Ticket Update',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Maintenance Ticket Update</h1>
        <p>Dear ${name},</p>
        <p>Your maintenance ticket #${ticketId} has been updated to: ${status}</p>
        <p>You can view the full details in your Nook dashboard.</p>
        <p>Best regards,<br>The Nook Team</p>
      </div>
    `,
  });
}

export async function sendLeaseExpirationReminder(email: string, name: string, propertyName: string, endDate: string) {
  await resend.emails.send({
    from: 'Nook <noreply@rentwithnook.com>',
    to: email,
    subject: 'Lease Expiration Reminder',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Lease Expiration Reminder</h1>
        <p>Dear ${name},</p>
        <p>Your lease for ${propertyName} will expire on ${endDate}.</p>
        <p>Please contact your property manager to discuss renewal options.</p>
        <p>Best regards,<br>The Nook Team</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  await resend.emails.send({
    from: 'Nook <noreply@rentwithnook.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The Nook Team</p>
      </div>
    `,
  });
} 
import sgMail from '@sendgrid/mail';
import { emailTemplates } from './email-templates';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('Missing SENDGRID_API_KEY environment variable');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type EmailTemplateData = {
  tenantName: string;
  reason?: string;
  amount?: number;
  inviterName?: string;
};

export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: EmailTemplateData) {
  try {
    const { subject, html } = emailTemplates[template](
      data.tenantName,
      data.reason || data.amount || data.inviterName || ''
    );
    
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@yourproperty.com',
      subject,
      html,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const emailService = {
  sendDocumentApproval: (email: string, tenantName: string) =>
    sendEmail(email, 'documentApproved', { tenantName }),

  sendDocumentRejection: (email: string, tenantName: string, reason: string) =>
    sendEmail(email, 'documentRejected', { tenantName, reason }),

  sendPaymentConfirmation: (email: string, tenantName: string, amount: number) =>
    sendEmail(email, 'paymentConfirmation', { tenantName, amount }),

  sendLeaseActivation: (email: string, tenantName: string) =>
    sendEmail(email, 'leaseActivation', { tenantName }),

  sendSplitRentInvitation: (email: string, tenantName: string, inviterName: string) =>
    sendEmail(email, 'splitRentInvitation', { tenantName, inviterName }),
}; 
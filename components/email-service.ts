import { resend } from '@/lib/email/client';

// Simple email templates
const emailTemplates = {
  documentApproved: (tenantName: string) => ({
    subject: 'Document Approved',
    html: `<h1>Document Approved</h1><p>Hello ${tenantName}, your document has been approved.</p>`
  }),
  documentRejected: (tenantName: string, reason: string) => ({
    subject: 'Document Rejected',
    html: `<h1>Document Rejected</h1><p>Hello ${tenantName}, your document has been rejected: ${reason}</p>`
  }),
  paymentConfirmation: (tenantName: string, amount: number) => ({
    subject: 'Payment Confirmation',
    html: `<h1>Payment Confirmation</h1><p>Hello ${tenantName}, your payment of $${amount} has been confirmed.</p>`
  }),
  leaseActivation: (tenantName: string) => ({
    subject: 'Lease Activation',
    html: `<h1>Lease Activation</h1><p>Hello ${tenantName}, your lease has been activated.</p>`
  }),
  splitRentInvitation: (tenantName: string, inviterName: string) => ({
    subject: 'Split Rent Invitation',
    html: `<h1>Split Rent Invitation</h1><p>Hello ${tenantName}, ${inviterName} has invited you to split rent.</p>`
  })
};

// Expect the Resend API key to be provided in the SENDGRID_API_KEY env var (per project convention)
if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('Missing SENDGRID_API_KEY (used for Resend) environment variable');
}

type EmailTemplateData = {
  tenantName: string;
  reason?: string;
  amount?: number;
  inviterName?: string;
  ticketTitle?: string;
  status?: string;
};

type EmailConfig = {
  to: string;
  subject: string;
  html: string;
  template?: keyof typeof emailTemplates;
  data?: EmailTemplateData;
};

export async function sendEmail(config: EmailConfig) {
  try {
    let subject = config.subject;
    let html = config.html;

    if (config.template && config.data) {
      let templateResult;
      
      switch (config.template) {
        case 'documentApproved':
          templateResult = emailTemplates.documentApproved(config.data.tenantName);
          break;
        case 'documentRejected':
          if (!config.data.reason) throw new Error('Reason is required for document rejection');
          templateResult = emailTemplates.documentRejected(config.data.tenantName, config.data.reason);
          break;
        case 'paymentConfirmation':
          if (!config.data.amount) throw new Error('Amount is required for payment confirmation');
          templateResult = emailTemplates.paymentConfirmation(config.data.tenantName, config.data.amount);
          break;
        case 'leaseActivation':
          templateResult = emailTemplates.leaseActivation(config.data.tenantName);
          break;
        case 'splitRentInvitation':
          if (!config.data.inviterName) throw new Error('Inviter name is required for split rent invitation');
          templateResult = emailTemplates.splitRentInvitation(config.data.tenantName, config.data.inviterName);
          break;
        default:
          throw new Error(`Unknown template: ${config.template}`);
      }
      
      subject = templateResult.subject;
      html = templateResult.html;
    }
    
    const msg = {
      to: config.to,
      from: process.env.EMAIL_FROM || 'noreply@yourproperty.com',
      subject,
      html,
    };

    await resend.emails.send({
      from: msg.from,
      to: Array.isArray(msg.to) ? msg.to : [msg.to],
      subject: msg.subject,
      html: msg.html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const emailService = {
  sendDocumentApproval: (email: string, tenantName: string) =>
    sendEmail({
      to: email,
      subject: 'Document Approved',
      html: '',
      template: 'documentApproved',
      data: { tenantName }
    }),

  sendDocumentRejection: (email: string, tenantName: string, reason: string) =>
    sendEmail({
      to: email,
      subject: 'Document Rejected',
      html: '',
      template: 'documentRejected',
      data: { tenantName, reason }
    }),

  sendPaymentConfirmation: (email: string, tenantName: string, amount: number) =>
    sendEmail({
      to: email,
      subject: 'Payment Confirmation',
      html: '',
      template: 'paymentConfirmation',
      data: { tenantName, amount }
    }),

  sendLeaseActivation: (email: string, tenantName: string) =>
    sendEmail({
      to: email,
      subject: 'Lease Activation',
      html: '',
      template: 'leaseActivation',
      data: { tenantName }
    }),

  sendSplitRentInvitation: (email: string, tenantName: string, inviterName: string) =>
    sendEmail({
      to: email,
      subject: 'Split Rent Invitation',
      html: '',
      template: 'splitRentInvitation',
      data: { tenantName, inviterName }
    }),
}; 
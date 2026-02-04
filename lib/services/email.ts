import { log } from '@/lib/logger';

export interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  template?: string;
  data?: Record<string, any>;
}

// Real email sending implementation using Resend
async function getEmailClient() {
  try {
    const { Resend } = await import('resend');
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    return new Resend(resendKey);
  } catch (error) {
    log.error('Failed to initialize email client', error as Error);
    throw error;
  }
}

export async function sendEmail(config: EmailConfig): Promise<void> {
  try {
    const resend = await getEmailClient();
    const fromEmail = process.env.EMAIL_FROM || 'noreply@nook.app';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: config.to,
      subject: config.subject,
      html: config.html,
    });

    if (result.error) {
      throw new Error(`Resend API error: ${result.error.message}`);
    }

    log.service('EmailService', 'sendEmail', { 
      to: config.to, 
      subject: config.subject,
      messageId: result.data?.id,
    });
  } catch (error) {
    log.error('Email send failed', error as Error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Reset Your Password', 
      html 
    });
  } catch (error) {
    log.error('Failed to send password reset email', error as Error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Nook!</h2>
        <p>We're excited to have you on board.</p>
        <p>You can now access your dashboard at any time to manage your properties and payments.</p>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Welcome to Nook!', 
      html 
    });
  } catch (error) {
    log.error('Failed to send welcome email', error as Error);
    throw error;
  }
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  role: string,
  acceptUrl: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited to join ${organizationName}</h2>
        <p>You've been invited to join as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${acceptUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Accept Invitation</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: `You've been invited to join ${organizationName}`, 
      html 
    });
  } catch (error) {
    log.error('Failed to send invitation email', error as Error);
    throw error;
  }
}

export async function sendMaintenanceRequestEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  requestUrl: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Maintenance Request</h2>
        <p>A new maintenance request has been submitted for <strong>${propertyName} Unit ${unitNumber}</strong>.</p>
        <p>Click the link below to view the request:</p>
        <a href="${requestUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Request</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'New Maintenance Request', 
      html 
    });
  } catch (error) {
    log.error('Failed to send maintenance request email', error as Error);
    throw error;
  }
}

export async function sendPaymentReminderEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  amount: number,
  dueDate: Date,
  paymentUrl: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Reminder</h2>
        <p>This is a reminder that your payment of <strong>$${amount}</strong> for ${propertyName} Unit ${unitNumber} is due on ${dueDate.toLocaleDateString()}.</p>
        <p>Click the link below to make your payment:</p>
        <a href="${paymentUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Make Payment</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Payment Reminder', 
      html 
    });
  } catch (error) {
    log.error('Failed to send payment reminder email', error as Error);
    throw error;
  }
}

export async function sendLeaseExpirationEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  expirationDate: Date,
  leaseUrl: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Lease Expiration Notice</h2>
        <p>Your lease for ${propertyName} Unit ${unitNumber} will expire on ${expirationDate.toLocaleDateString()}.</p>
        <p>Click the link below to review your lease:</p>
        <a href="${leaseUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Review Lease</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Lease Expiration Notice', 
      html 
    });
  } catch (error) {
    log.error('Failed to send lease expiration email', error as Error);
    throw error;
  }
}

// Email service for sending notifications

export async function sendTenantInvitation(
  email: string,
  propertyName: string,
  unitNumber: string,
  invitationLink: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tenant Invitation</h2>
        <p>You have been invited to become a tenant for <strong>${propertyName} Unit ${unitNumber}</strong>.</p>
        <p>Click the link below to accept your invitation:</p>
        <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Accept Invitation</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Tenant Invitation', 
      html 
    });
  } catch (error) {
    log.error('Failed to send tenant invitation', error as Error);
    throw error;
  }
}

export async function sendDocumentApprovalNotification(
  email: string,
  documentName: string,
  approvalLink: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Document Approved</h2>
        <p>Your document <strong>"${documentName}"</strong> has been approved.</p>
        <p>Click the link below to view it:</p>
        <a href="${approvalLink}" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Document</a>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Document Approved', 
      html 
    });
  } catch (error) {
    log.error('Failed to send document approval notification', error as Error);
    throw error;
  }
}

export async function sendDocumentRejectionNotification(
  email: string,
  documentName: string,
  reason: string
): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Document Rejected</h2>
        <p>Your document <strong>"${documentName}"</strong> has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please resubmit with the requested changes.</p>
      </div>
    `;
    return await sendEmail({ 
      to: email, 
      subject: 'Document Rejected', 
      html 
    });
  } catch (error) {
    log.error('Failed to send document rejection notification', error as Error);
    throw error;
  }
}

export async function sendPaymentReceipt(
  email: string,
  amount: number,
  propertyName: string,
  receiptUrl: string
): Promise<void> {
  // TODO: Implement actual email sending
  log.service('EmailService', 'sendPaymentReceipt', { 
    email, 
    amount, 
    propertyName, 
    receiptUrl 
  });
}

export async function sendUsageAlert(
  email: string,
  alertType: string,
  currentValue: number,
  limitValue: number
): Promise<void> {
  // TODO: Implement actual email sending
  log.service('EmailService', 'sendUsageAlert', { 
    email, 
    alertType, 
    currentValue, 
    limitValue 
  });
} 
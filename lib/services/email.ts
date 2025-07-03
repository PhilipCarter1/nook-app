// Mock email service for testing
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  // Mock implementation for testing
  console.log('Mock email sent:', { to, subject });
  return Promise.resolve();
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  const subject = 'Reset Your Password';
  const html = `
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  const subject = 'Welcome to Nook!';
  const html = `
    <p>Welcome to Nook! We're excited to have you on board.</p>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  role: string,
  acceptUrl: string
): Promise<void> {
  const subject = `You've been invited to join ${organizationName}`;
  const html = `
    <h1>You've been invited to join ${organizationName}</h1>
    <p>You've been invited to join as a ${role}.</p>
    <p>Click the link below to accept the invitation:</p>
    <a href="${acceptUrl}">Accept Invitation</a>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendMaintenanceRequestEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  requestUrl: string
): Promise<void> {
  const subject = 'New Maintenance Request';
  const html = `
    <h1>New Maintenance Request</h1>
    <p>A new maintenance request has been submitted for ${propertyName} Unit ${unitNumber}.</p>
    <p>Click the link below to view the request:</p>
    <a href="${requestUrl}">View Request</a>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendPaymentReminderEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  amount: number,
  dueDate: Date,
  paymentUrl: string
): Promise<void> {
  const subject = 'Payment Reminder';
  const html = `
    <h1>Payment Reminder</h1>
    <p>This is a reminder that your payment of $${amount} for ${propertyName} Unit ${unitNumber} is due on ${dueDate.toLocaleDateString()}.</p>
    <p>Click the link below to make your payment:</p>
    <a href="${paymentUrl}">Make Payment</a>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendLeaseExpirationEmail(
  email: string,
  propertyName: string,
  unitNumber: string,
  expirationDate: Date,
  leaseUrl: string
): Promise<void> {
  const subject = 'Lease Expiration Notice';
  const html = `
    <h1>Lease Expiration Notice</h1>
    <p>Your lease for ${propertyName} Unit ${unitNumber} will expire on ${expirationDate.toLocaleDateString()}.</p>
    <p>Click the link below to review your lease:</p>
    <a href="${leaseUrl}">Review Lease</a>
  `;
  return sendEmail({ to: email, subject, html });
}

// Email service for sending notifications
// This is a placeholder implementation - replace with your actual email service (SendGrid, AWS SES, etc.)

export async function sendTenantInvitation(
  email: string,
  propertyName: string,
  unitNumber: string,
  invitationLink: string
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`Sending tenant invitation to ${email} for ${propertyName} unit ${unitNumber}`);
  console.log(`Invitation link: ${invitationLink}`);
}

export async function sendDocumentApprovalNotification(
  email: string,
  documentName: string,
  approvalLink: string
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`Sending document approval notification to ${email} for ${documentName}`);
  console.log(`Approval link: ${approvalLink}`);
}

export async function sendDocumentRejectionNotification(
  email: string,
  documentName: string,
  reason: string
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`Sending document rejection notification to ${email} for ${documentName}`);
  console.log(`Reason: ${reason}`);
}

export async function sendPaymentReceipt(
  email: string,
  amount: number,
  propertyName: string,
  receiptUrl: string
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`Sending payment receipt to ${email} for $${amount} at ${propertyName}`);
  console.log(`Receipt URL: ${receiptUrl}`);
}

export async function sendUsageAlert(
  email: string,
  alertType: string,
  currentValue: number,
  limitValue: number
): Promise<void> {
  // TODO: Implement actual email sending
  console.log(`Sending usage alert to ${email} for ${alertType}: ${currentValue}/${limitValue}`);
} 
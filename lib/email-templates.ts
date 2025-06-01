export interface EmailTemplate {
  subject: string;
  html: string;
}

export const emailTemplates = {
  documentApproved: (tenantName: string): EmailTemplate => ({
    subject: 'Document Approved - Next Steps',
    html: `
      <h1>Hello ${tenantName},</h1>
      <p>Great news! Your document has been approved.</p>
      <p>You can now proceed with the payment process to complete your onboarding.</p>
      <p>Please log in to your account to continue.</p>
      <p>Best regards,<br>The Property Management Team</p>
    `,
  }),

  documentRejected: (tenantName: string, reason: string): EmailTemplate => ({
    subject: 'Document Review Update',
    html: `
      <h1>Hello ${tenantName},</h1>
      <p>We've reviewed your document, but unfortunately, it couldn't be approved at this time.</p>
      <p>Reason: ${reason}</p>
      <p>Please log in to your account to upload a new document.</p>
      <p>Best regards,<br>The Property Management Team</p>
    `,
  }),

  paymentConfirmation: (tenantName: string, amount: number): EmailTemplate => ({
    subject: 'Payment Confirmation',
    html: `
      <h1>Hello ${tenantName},</h1>
      <p>We've received your payment of $${amount.toFixed(2)}.</p>
      <p>Your lease is now active. Welcome to your new home!</p>
      <p>You can access your tenant portal to view your lease details and manage your account.</p>
      <p>Best regards,<br>The Property Management Team</p>
    `,
  }),

  leaseActivation: (tenantName: string): EmailTemplate => ({
    subject: 'Lease Activation Confirmation',
    html: `
      <h1>Hello ${tenantName},</h1>
      <p>Your lease has been activated successfully!</p>
      <p>You can now access all tenant features in your portal, including:</p>
      <ul>
        <li>Maintenance requests</li>
        <li>Rent payments</li>
        <li>Document storage</li>
        <li>Communication with property management</li>
      </ul>
      <p>Best regards,<br>The Property Management Team</p>
    `,
  }),

  splitRentInvitation: (tenantName: string, inviterName: string): EmailTemplate => ({
    subject: 'Split Rent Invitation',
    html: `
      <h1>Hello ${tenantName},</h1>
      <p>${inviterName} has invited you to split rent payments.</p>
      <p>Please log in to your account to review and accept the invitation.</p>
      <p>Best regards,<br>The Property Management Team</p>
    `,
  }),
}; 
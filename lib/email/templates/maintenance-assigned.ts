import { EmailTemplate } from '../types';

export const maintenanceAssignedTemplate: EmailTemplate = {
  subject: 'Maintenance Ticket Assigned',
  html: ({ ticketTitle, propertyName, unitNumber }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Maintenance Ticket Assigned</h2>
      <p>Your maintenance ticket has been assigned to a supervisor:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Ticket:</strong> ${ticketTitle}</p>
        <p style="margin: 10px 0;"><strong>Property:</strong> ${propertyName}</p>
        <p style="margin: 10px 0;"><strong>Unit:</strong> ${unitNumber}</p>
        <p style="margin: 10px 0;"><strong>Status:</strong> In Progress</p>
      </div>

      <p>A supervisor will be working on your maintenance request. You'll receive updates as the status changes.</p>
      
      <p>You can view the full details of your maintenance ticket by logging into your tenant portal.</p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,
}; 
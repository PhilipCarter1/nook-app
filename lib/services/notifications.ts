import {
  sendMaintenanceRequestEmail,
  sendPaymentReminderEmail,
  sendLeaseExpirationEmail,
} from './email';

export interface Notification {
  id: string;
  type: 'maintenance' | 'payment' | 'lease' | 'message' | 'document' | 'workflow' | 'reminder';
  title: string;
  message: string;
  link: string | null;
  data: Record<string, any> | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotification {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: 'maintenance' | 'payment' | 'lease' | 'message' | 'document' | 'workflow' | 'reminder';
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
}

// Mock implementation for launch readiness
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  data,
}: CreateNotificationParams): Promise<Notification> {
  // Mock implementation - just log for now
  console.log('Notification created:', { userId, type, title, message });
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    title,
    message,
    link: link || null,
    data: data || null,
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  // Mock implementation
  console.log('Getting notifications for user:', userId);
  return [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  // Mock implementation
  console.log('Marking notification as read:', notificationId);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  // Mock implementation
  console.log('Marking all notifications as read for user:', userId);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  // Mock implementation
  console.log('Deleting notification:', notificationId);
}

export async function notifyMaintenanceRequest(
  userId: string,
  propertyName: string,
  unitNumber: string,
  requestId: string,
  email?: string
): Promise<void> {
  // Create in-app notification
  await createNotification({
    userId,
    type: 'maintenance',
    title: 'New Maintenance Request',
    message: `A new maintenance request has been submitted for ${propertyName} Unit ${unitNumber}`,
    link: `/dashboard/maintenance/${requestId}`,
    data: { propertyName, unitNumber, requestId },
  });

  // Send email notification if email is provided
  if (email) {
    await sendMaintenanceRequestEmail(
      email,
      propertyName,
      unitNumber,
      `/dashboard/maintenance/${requestId}`
    );
  }
}

export async function notifyPaymentDue(
  userId: string,
  propertyName: string,
  unitNumber: string,
  amount: number,
  dueDate: Date,
  email?: string
): Promise<void> {
  // Create in-app notification
  await createNotification({
    userId,
    type: 'payment',
    title: 'Payment Due',
    message: `Payment of $${amount} for ${propertyName} Unit ${unitNumber} is due on ${dueDate.toLocaleDateString()}`,
    link: '/dashboard/payments',
    data: { propertyName, unitNumber, amount, dueDate },
  });

  // Send email notification if email is provided
  if (email) {
    await sendPaymentReminderEmail(email, propertyName, unitNumber, amount, dueDate, '/dashboard/payments');
  }
}

export async function notifyLeaseExpiration(
  userId: string,
  propertyName: string,
  unitNumber: string,
  expirationDate: Date,
  email?: string
): Promise<void> {
  // Create in-app notification
  await createNotification({
    userId,
    type: 'lease',
    title: 'Lease Expiring Soon',
    message: `Your lease for ${propertyName} Unit ${unitNumber} will expire on ${expirationDate.toLocaleDateString()}`,
    link: '/dashboard/leases',
    data: { propertyName, unitNumber, expirationDate },
  });

  // Send email notification if email is provided
  if (email) {
    await sendLeaseExpirationEmail(
      email,
      propertyName,
      unitNumber,
      expirationDate,
      '/dashboard/leases'
    );
  }
}

export async function notifyNewMessage(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<Notification> {
  return createNotification({
    userId,
    type: 'message',
    title: `New message from ${senderName}`,
    message: messagePreview,
    link: `/dashboard/messages?conversation=${conversationId}`,
    data: { senderName, conversationId },
  });
}

export async function notifyDocumentUpdate(
  userId: string,
  documentName: string,
  action: 'signed' | 'approved' | 'rejected' | 'updated',
  documentId: string
): Promise<Notification> {
  const actionMap = {
    signed: 'has been signed',
    approved: 'has been approved',
    rejected: 'has been rejected',
    updated: 'has been updated',
  };

  return createNotification({
    userId,
    type: 'document',
    title: 'Document Update',
    message: `Document "${documentName}" ${actionMap[action]}`,
    link: `/dashboard/documents/${documentId}`,
    data: { documentName, action, documentId },
  });
}

export async function sendNotification(notification: CreateNotificationParams): Promise<void> {
  await createNotification(notification);
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return [];
}

export async function getDocumentNotifications(documentId: string): Promise<Notification[]> {
  // Mock implementation
  console.log('Getting document notifications for:', documentId);
  return [];
}

// Document-specific notification helpers
export async function notifyDocumentUpload(document: any, uploadedBy: any) {
  const landlordId = document.landlordId;
  const tenantId = document.tenantId;

  // Notify landlord
  await sendNotification({
    userId: landlordId,
    type: 'document',
    title: 'New Document Uploaded',
    message: `${uploadedBy.name} has uploaded a new document: ${document.name}`,
    link: `/dashboard/documents/${document.id}`,
  });

  // Notify tenant if uploaded by landlord
  if (uploadedBy.role === 'landlord') {
    await sendNotification({
      userId: tenantId,
      type: 'document',
      title: 'New Document Available',
      message: `Your landlord has uploaded a new document: ${document.name}`,
      link: `/dashboard/documents/${document.id}`,
    });
  }
}

export async function notifyDocumentApproval(document: any, approvedBy: any) {
  const landlordId = document.landlordId;
  const tenantId = document.tenantId;

  // Notify tenant
  await sendNotification({
    userId: tenantId,
    type: 'workflow',
    title: 'Document Approved',
    message: `${approvedBy.name} has approved the document: ${document.name}`,
    link: `/dashboard/documents/${document.id}`,
  });

  // Notify landlord if approved by tenant
  if (approvedBy.role === 'tenant') {
    await sendNotification({
      userId: landlordId,
      type: 'workflow',
      title: 'Document Approved by Tenant',
      message: `The tenant has approved the document: ${document.name}`,
      link: `/dashboard/documents/${document.id}`,
    });
  }
}

export async function notifyDocumentRejection(document: any, rejectedBy: any, reason: string) {
  const landlordId = document.landlordId;
  const tenantId = document.tenantId;

  // Notify tenant
  await sendNotification({
    userId: tenantId,
    type: 'workflow',
    title: 'Document Rejected',
    message: `${rejectedBy.name} has rejected the document: ${document.name}. Reason: ${reason}`,
    link: `/dashboard/documents/${document.id}`,
  });

  // Notify landlord if rejected by tenant
  if (rejectedBy.role === 'tenant') {
    await sendNotification({
      userId: landlordId,
      type: 'workflow',
      title: 'Document Rejected by Tenant',
      message: `The tenant has rejected the document: ${document.name}. Reason: ${reason}`,
      link: `/dashboard/documents/${document.id}`,
    });
  }
}

export async function notifyDocumentExpiration(document: any) {
  const landlordId = document.landlordId;
  const tenantId = document.tenantId;

  // Notify both parties
  await Promise.all([
    sendNotification({
      userId: landlordId,
      type: 'reminder',
      title: 'Document Expiring Soon',
      message: `The document "${document.name}" will expire in 7 days.`,
      link: `/dashboard/documents/${document.id}`,
    }),
    sendNotification({
      userId: tenantId,
      type: 'reminder',
      title: 'Document Expiring Soon',
      message: `The document "${document.name}" will expire in 7 days.`,
      link: `/dashboard/documents/${document.id}`,
    }),
  ]);
} 
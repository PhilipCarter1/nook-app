import { db } from '@/lib/db';
import { documents, documentTemplates, documentSignatures } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sendDocumentApprovalNotification, sendDocumentRejectionNotification } from './email';

export interface DocumentMetadata {
  size: number;
  mimeType: string;
  pages?: number;
  expirationDate?: string;
  tags?: string[];
  category?: string;
}

export interface DocumentSignature {
  userId: string;
  signedAt: string;
  signatureType: 'digital' | 'electronic';
  signatureData: string;
}

export interface DocumentShare {
  userId: string;
  permission: 'view' | 'edit' | 'sign';
  sharedAt: string;
}

export interface DocumentAnalytics {
  views: number;
  downloads: number;
  shares: number;
  lastViewed: string;
  lastDownloaded: string;
  lastShared: string;
  viewers: {
    userId: string;
    name: string;
    lastViewed: string;
  }[];
}

export interface DocumentComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  pageNumber?: number;
  position?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWorkflow {
  steps: {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    assignedTo: {
      id: string;
      name: string;
      role: string;
    };
    dueDate: string;
    completedAt?: string;
    comments?: string;
  }[];
  currentStep: number;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'completed';
}

export interface DocumentAuditLog {
  id: string;
  action: 'view' | 'download' | 'share' | 'comment' | 'sign' | 'approve' | 'reject' | 'renew';
  userId: string;
  userName: string;
  timestamp: string;
  details?: {
    ipAddress?: string;
    userAgent?: string;
    targetUser?: string;
    comments?: string;
    version?: number;
  };
}

export interface DocumentVersion {
  version: number;
  url: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Document {
  id: string;
  property: string;
  tenantId: string;
  type: 'id' | 'income' | 'credit' | 'background' | 'lease' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  url: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface CreateDocumentParams {
  property: string;
  tenantId: string;
  type: Document['type'];
  url: string;
  notes?: string;
}

export async function createDocument({
  property,
  tenantId,
  type,
  url,
  notes,
}: CreateDocumentParams): Promise<Document> {
  const [document] = await db
    .insert(documents)
    .values({
      property,
      tenantId,
      type,
      url,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return document;
}

export async function getDocuments(id: string): Promise<Document[]> {
  return db
    .select()
    .from(documents)
    .where(eq(documents.property, id))
    .orderBy(documents.createdAt);
}

export async function getTenantDocuments(tenantId: string): Promise<Document[]> {
  return db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, tenantId))
    .orderBy(documents.createdAt);
}

export async function approveDocument(
  documentId: string,
  landlordId: string,
  notes?: string
): Promise<Document> {
  const [document] = await db
    .update(documents)
    .set({
      status: 'approved',
      notes,
      reviewedBy: landlordId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (document) {
    await sendDocumentApprovalNotification({
      documentId: document.id,
      tenantId: document.tenantId,
      documentType: document.type,
      notes,
    });
  }

  return document;
}

export async function rejectDocument(
  documentId: string,
  landlordId: string,
  notes: string
): Promise<Document> {
  const [document] = await db
    .update(documents)
    .set({
      status: 'rejected',
      notes,
      reviewedBy: landlordId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (document) {
    await sendDocumentRejectionNotification({
      documentId: document.id,
      tenantId: document.tenantId,
      documentType: document.type,
      notes,
    });
  }

  return document;
}

export async function getPendingDocuments(id: string): Promise<Document[]> {
  return db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.property, id),
        eq(documents.status, 'pending')
      )
    )
    .orderBy(documents.createdAt);
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));
  
  return document || null;
}

export async function uploadDocument(
  tenantId: string,
  type: string,
  name: string,
  url: string,
  metadata: DocumentMetadata
) {
  const document = await db.insert(documents).values({
    tenantId,
    type,
    name,
    url,
    metadata,
    version: 1,
    status: 'pending',
    analytics: {
      views: 0,
      downloads: 0,
      shares: 0,
      lastViewed: new Date().toISOString(),
      lastDownloaded: new Date().toISOString(),
      lastShared: new Date().toISOString(),
      viewers: [],
    },
    comments: [],
    workflow: {
      steps: [],
      currentStep: 0,
      status: 'draft',
    },
    auditLogs: [],
    previousVersions: [],
  });

  return document;
}

export async function getDocument(id: string) {
  return db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
}

export async function getDocumentsByTenant(tenantId: string) {
  return db.query.documents.findMany({
    where: eq(documents.tenantId, tenantId),
  });
}

export async function updateDocument(
  id: string,
  updates: Partial<typeof documents.$inferSelect>
) {
  return db
    .update(documents)
    .set(updates)
    .where(eq(documents.id, id));
}

export async function deleteDocument(id: string) {
  return db.delete(documents).where(eq(documents.id, id));
}

export async function shareDocument(
  documentId: string,
  share: DocumentShare
) {
  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found');

  const sharedWith = [...(document.sharedWith || []), share];
  return updateDocument(documentId, { sharedWith });
}

export async function addComment(
  documentId: string,
  comment: DocumentComment
) {
  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found');

  const comments = [...(document.comments || []), comment];
  return updateDocument(documentId, { comments });
}

export async function signDocument(
  documentId: string,
  signature: DocumentSignature
) {
  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found');

  const signatures = [...(document.signatures || []), signature];
  return updateDocument(documentId, { signatures });
}

export async function logDocumentAction(
  documentId: string,
  log: DocumentAuditLog
) {
  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found');

  const auditLogs = [...(document.auditLogs || []), log];
  return updateDocument(documentId, { auditLogs });
}

export async function createNewVersion(
  documentId: string,
  url: string,
  updatedBy: string
) {
  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found');

  const newVersion = {
    version: document.version + 1,
    url,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  const previousVersions = [
    ...(document.previousVersions || []),
    {
      version: document.version,
      url: document.url,
      updatedAt: document.updatedAt,
      updatedBy: document.updatedBy,
    },
  ];

  return updateDocument(documentId, {
    version: newVersion.version,
    url: newVersion.url,
    updatedAt: newVersion.updatedAt,
    updatedBy: newVersion.updatedBy,
    previousVersions,
  });
} 
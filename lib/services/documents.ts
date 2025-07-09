// Mock documents service for Vercel deployment
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

export async function createDocument(params: CreateDocumentParams): Promise<Document> {
  return {
    id: 'mock-id',
    property: params.property,
    tenantId: params.tenantId,
    type: params.type,
    url: params.url,
    notes: params.notes,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getDocuments(id: string): Promise<Document[]> {
  return [];
}

export async function getTenantDocuments(tenantId: string): Promise<Document[]> {
  return [];
}

export async function approveDocument(
  documentId: string,
  landlordId: string,
  notes?: string
): Promise<Document> {
  return {
    id: documentId,
    property: 'mock-property',
    tenantId: 'mock-tenant',
    type: 'id',
    url: 'mock-url',
    notes,
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewedBy: landlordId,
    reviewedAt: new Date(),
  };
}

export async function rejectDocument(
  documentId: string,
  landlordId: string,
  notes: string
): Promise<Document> {
  return {
    id: documentId,
    property: 'mock-property',
    tenantId: 'mock-tenant',
    type: 'id',
    url: 'mock-url',
    notes,
    status: 'rejected',
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewedBy: landlordId,
    reviewedAt: new Date(),
  };
}

export async function getPendingDocuments(id: string): Promise<Document[]> {
  return [];
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
  return null;
}

export async function uploadDocument(
  tenantId: string,
  type: string,
  name: string,
  url: string,
  metadata: any
) {
  return {
    id: 'mock-id',
    property: 'mock-property',
    tenantId,
    type: type as any,
    url,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getDocument(id: string) {
  return null;
}

export async function getDocumentsByTenant(tenantId: string) {
  return [];
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  return {
    id,
    property: 'mock-property',
    tenantId: 'mock-tenant',
    type: 'id',
    url: 'mock-url',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...updates,
  };
}

export async function deleteDocument(id: string) {
  // Mock implementation
} 
"use client";

import { MainLayout } from "@/components/layout/MainLayout";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { DocumentUpload } from "@/components/documents/DocumentUpload";

export default function DocumentsPage() {
  const handleUpload = async (file: File, metadata: any) => {
    // TODO: Implement actual upload logic
  };

  const handleCancel = () => {
    // TODO: Implement cancel logic
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your property documents.
          </p>
        </div>

        <DocumentUpload onUpload={handleUpload} onCancel={handleCancel} />
      </div>
    </MainLayout>
  );
} 
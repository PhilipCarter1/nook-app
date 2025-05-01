import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentUpload } from "@/components/documents/DocumentUpload";

export default function DocumentsPage() {
  return (
    <MainLayout userRole="tenant">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your property documents.
          </p>
        </div>

        <DocumentUpload />
      </div>
    </MainLayout>
  );
} 
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { getOrganization } from '@/lib/services/organization';
import { getDocumentsByTenant } from '@/lib/services/documents';
import { FileIcon, Share2, MessageSquare, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documents | Nook',
  description: 'Manage your documents',
};

export default async function DocumentsPage() {
  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  const documents = await getDocumentsByTenant(organization.id);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Documents</h1>
          <Button>Upload Document</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.type} • v{doc.version}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>{doc.comments?.length || 0} comments</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {documents.length === 0 && (
          <Card className="p-12 text-center">
            <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first document to get started
            </p>
            <Button>Upload Document</Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 
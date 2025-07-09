import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentApproval } from '@/components/documents/DocumentApproval';
import { PaymentMethodConfig } from '@/components/payments/PaymentMethodConfig';
import { getProperty } from '@/lib/services/properties';
import { getDocuments } from '@/lib/services/documents';
import { getPaymentMethods } from '@/lib/services/payment-methods';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Property Settings | Nook',
  description: 'Manage your property settings',
};

export default async function PropertySettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const property = await getProperty(params.id);
  if (!property) {
    redirect('/dashboard/properties');
  }

  const [documents, paymentMethods] = await Promise.all([
    getDocuments(params.id),
    getPaymentMethods(params.id),
  ]);

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Property Settings</h1>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documents">Document Approval</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid gap-6">
              {documents.map((document) => (
                <DocumentApproval
                  key={document.id}
                  document={document}
                  onUpdate={() => {
                    // Refresh the page to get updated documents
                    window.location.reload();
                  }}
                />
              ))}
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No documents pending approval</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentMethodConfig
              id={params.id}
              initialMethods={paymentMethods}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 
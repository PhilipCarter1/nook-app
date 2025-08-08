import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/MainLayout';
import { getOrganization } from '@/lib/services/organization';
import { createApplication } from '@/lib/services/applications';
import { FileUpload } from '@/components/ui/file-upload';

export const metadata: Metadata = {
  title: 'New Application | Nook',
  description: 'Submit a new rental application',
};

export default async function NewApplicationPage() {
  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">New Application</h1>

        <Card className="p-6">
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <Input
                  id="moveInDate"
                  name="moveInDate"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Required Documents</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Government ID</Label>
                  <FileUpload
                    accept="image/*,.pdf"
                    maxSize={5 * 1024 * 1024} // 5MB
                    onUpload={(file) => {
                      // Handle file upload
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Proof of Income</Label>
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    maxSize={5 * 1024 * 1024}
                    onUpload={(file) => {
                      // Handle file upload
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Employment Verification</Label>
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    maxSize={5 * 1024 * 1024}
                    onUpload={(file) => {
                      // Handle file upload
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button">
                Save Draft
              </Button>
              <Button type="submit">Submit Application</Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
} 
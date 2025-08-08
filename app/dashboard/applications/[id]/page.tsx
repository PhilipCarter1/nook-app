import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { createOrganization } from '@/lib/services/organization';
import { getApplication, reviewApplication } from '@/lib/services/applications';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Application Review | Nook',
  description: 'Review rental application',
};

interface ApplicationReviewPageProps {
  params: {
    id: string;
  };
}

interface ApplicationDocument {
  id: string;
  type: string;
  url: string;
  created_at: string;
}

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  move_in_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  documents: ApplicationDocument[];
}

export default async function ApplicationReviewPage({
  params,
}: ApplicationReviewPageProps) {
  const organization = await createOrganization({
    name: 'Demo Org',
    email: 'demo@nook.com',
    phone: '555-555-5555',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
  });
  if (!organization) {
    redirect('/auth/signin');
  }

  const application = await getApplication(params.id) as Application;
  if (!application) {
    redirect('/dashboard/applications');
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Application Review</h1>
            <p className="text-muted-foreground">
              Submitted on {format(new Date(application.created_at), 'PPP')}
            </p>
          </div>
          <Badge
            variant={
              application.status === 'approved'
                ? 'default'
                : application.status === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Applicant Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1">
                  {application.first_name} {application.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1">{application.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="mt-1">{application.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Move-in Date
                </dt>
                <dd className="mt-1">
                  {format(new Date(application.move_in_date), 'PPP')}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="space-y-4">
              {application.documents.map((doc: ApplicationDocument) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on {format(new Date(doc.created_at), 'PPP')}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Review</h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add your review notes here..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="destructive"
                  type="button"
                  onClick={async () => {
                    'use server';
                    await reviewApplication(application.id, 'rejected', '');
                    redirect('/dashboard/applications');
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    'use server';
                    await reviewApplication(application.id, 'approved', '');
                    redirect('/dashboard/applications');
                  }}
                >
                  Approve
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 
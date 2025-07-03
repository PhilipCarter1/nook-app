import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { getOrganization } from '@/lib/services/organization';
import { getApplicationsByProperty } from '@/lib/services/applications';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Applications | Nook',
  description: 'Manage rental applications',
};

export default async function ApplicationsPage() {
  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  const applications = await getApplicationsByProperty(organization.id);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Applications</h1>
          <Button>New Application</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application: any) => (
            <Card key={application.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {application.firstName} {application.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {application.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {application.status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : application.status === 'rejected' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Submitted{' '}
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{application.documents.length} documents</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Progress</div>
                <div className="space-y-2">
                  {application.workflow.steps.map((step: any, index: number) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{step.name}</span>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : step.status === 'skipped' ? (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {application.status === 'under_review' && (
                  <Button size="sm" className="flex-1">
                    Review
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Applications will appear here when submitted
            </p>
            <Button>New Application</Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 
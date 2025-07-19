import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { TenantInvitations } from '@/components/tenants/TenantInvitations';
import { MainLayout } from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Tenant Invitations | Nook',
  description: 'Manage tenant invitations for your properties',
};

export default async function TenantInvitationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <TenantInvitations
          organizationId={user.organization_id}
          userId={user.id}
        />
      </div>
    </MainLayout>
  );
} 
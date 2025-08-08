import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { MessagesClient } from './MessagesClient';
import { getOrganization } from '@/lib/services/organization';
import { getConversations } from '@/lib/services/messages';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export const metadata: Metadata = {
  title: 'Messages | Nook',
  description: 'Communicate with your tenants and property managers.',
};

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  const conversations = await getConversations(organization.id);

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)]">
        <MessagesClient
          initialConversations={conversations}
          userId={organization.id}
        />
      </div>
    </MainLayout>
  );
} 
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { acceptTenantInvitation } from '@/lib/services/invitations';

export const metadata: Metadata = {
  title: 'Accept Invitation | Nook',
  description: 'Accept your invitation to join Nook',
};

interface InvitePageProps {
  params: {
    id: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { data: invitation, error } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !invitation) {
    redirect('/404');
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation is no longer valid. Please contact your landlord for a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation has expired. Please contact your landlord for a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            You've been invited to join Nook as a tenant. Please sign in or create an account to accept this invitation.
          </p>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={async () => {
                'use server';
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                  redirect('/auth/signin?redirect=/invite/' + params.id);
                }
                await acceptTenantInvitation(params.id, session.user.id);
                redirect('/dashboard');
              }}
            >
              Sign In to Accept
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                redirect('/auth/signup?redirect=/invite/' + params.id);
              }}
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import React from 'react';
import { getClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import TicketManagement from '@/components/TicketManagement';

export default async function SupervisorDashboard() {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get supervisor record
  const { data: supervisor } = await supabase
    .from('supervisors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!supervisor) {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Supervisor Dashboard</h1>
      <TicketManagement role="super" userId={user.id} />
    </div>
  );
} 
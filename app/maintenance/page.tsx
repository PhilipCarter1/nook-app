'use client';

import React from 'react';
import { MaintenanceTicketList } from '@/components/maintenance/MaintenanceTicketList';
import { MaintenanceTicketForm } from '@/components/maintenance/MaintenanceTicketForm';
import { MaintenanceTicketDetail } from '@/components/maintenance/MaintenanceTicketDetail';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMaintenanceTicket,
  getMaintenanceTickets,
  getMaintenanceTicket,
  updateMaintenanceTicket,
  addMaintenanceComment,
  assignMaintenanceTicket,
} from '@/lib/services/maintenance';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { useAuth } from '@/components/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function MaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const ticketId = searchParams?.get('ticket') || null;
  const isCreating = searchParams?.get('create') === 'true';

  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['maintenance-tickets'],
    queryFn: () => getMaintenanceTickets(),
  });

  const { data: selectedTicket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['maintenance-ticket', ticketId],
    queryFn: () => getMaintenanceTicket(ticketId!),
    enabled: !!ticketId,
  });

  const createMutation = useMutation({
    mutationFn: createMaintenanceTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
      toast.success('Maintenance ticket created successfully');
      router.push('/maintenance');
    },
    onError: (error) => {
      toast.error('Failed to create maintenance ticket');
      console.error('Create ticket error:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateMaintenanceTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] });
      toast.success('Maintenance ticket updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update maintenance ticket');
      console.error('Update ticket error:', error);
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) =>
      addMaintenanceComment({
        ticket_id: ticketId,
        user_id: user?.id || '',
        content,
        is_internal: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Add comment error:', error);
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, vendorId }: { ticketId: string; vendorId: string }) =>
      assignMaintenanceTicket(ticketId, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-ticket', ticketId] });
      toast.success('Vendor assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign vendor');
      console.error('Assign vendor error:', error);
    },
  });

  const handleCreateTicket = async (data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    mediaUrls: string[];
  }) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a ticket');
      return;
    }

    await createMutation.mutateAsync({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'open',
      tenant_id: user.id,
      property_id: 'current-property-id', // Replace with actual property ID
      unit_id: 'current-unit-id', // Replace with actual unit ID
      category: 'other',
      is_urgent: false,
      is_premium: false,
    });
  };

  const handleStatusChange = async (status: string) => {
    if (!ticketId) return;
    await updateMutation.mutateAsync({
      id: ticketId,
      data: { status },
    });
  };

  const handlePriorityChange = async (priority: string) => {
    if (!ticketId) return;
    await updateMutation.mutateAsync({
      id: ticketId,
      data: { priority },
    });
  };

  const handleComment = async (content: string) => {
    if (!ticketId || !user?.id) return;
    await commentMutation.mutateAsync({
      ticketId,
      content,
    });
  };

  const handleAssign = async (vendorId: string) => {
    if (!ticketId) return;
    await assignMutation.mutateAsync({
      ticketId,
      vendorId,
    });
  };

  if (isCreating) {
    return (
      <MaintenanceTicketForm
        onSubmit={handleCreateTicket}
        onCancel={() => router.push('/maintenance')}
      />
    );
  }

  if (ticketId && selectedTicket) {
    return (
      <MaintenanceTicketDetail
        ticket={selectedTicket}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onComment={handleComment}
        onAssign={handleAssign}
        onClose={() => router.push('/maintenance')}
      />
    );
  }

  if (isLoadingTickets) {
    return (
      <PremiumLayout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </PremiumLayout>
    );
  }

  return (
    <MaintenanceTicketList />
  );
} 
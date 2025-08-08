'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { MaintenanceTicketDetail } from '@/components/maintenance/MaintenanceTicketDetail';
import { MaintenanceTicketForm } from '@/components/maintenance/MaintenanceTicketForm';
import { useParams } from 'next/navigation';

export default function MaintenanceTicketPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const [isEditing, setIsEditing] = useState(false);

  // Create a mock ticket object for the detail view
  const mockTicket = {
    id: ticketId,
    property_id: 'property-1',
    unit_id: 'unit-1',
    tenant_id: 'tenant-1',
    title: 'Sample Maintenance Request',
    description: 'This is a sample maintenance request for demonstration purposes.',
    status: 'open' as const,
    priority: 'medium' as const,
    category: 'other' as const,
    assigned_to: undefined,
    scheduled_date: undefined,
    scheduled_time_slot: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    resolved_at: undefined,
    estimated_cost: undefined,
    actual_cost: undefined,
    is_urgent: false,
    is_premium: false,
  };

  return (
    <div className="container mx-auto py-6">
      {isEditing ? (
        <MaintenanceTicketForm
          onSubmit={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <MaintenanceTicketDetail
          ticket={mockTicket}
          onClose={() => setIsEditing(true)}
        />
      )}
    </div>
  );
} 
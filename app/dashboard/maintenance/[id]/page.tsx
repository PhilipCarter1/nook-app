'use client';

import { useState } from 'react';
import { MaintenanceTicketDetail } from '@/components/maintenance/MaintenanceTicketDetail';
import { MaintenanceTicketForm } from '@/components/maintenance/MaintenanceTicketForm';
import { useParams } from 'next/navigation';

export default function MaintenanceTicketPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto py-6">
      {isEditing ? (
        <MaintenanceTicketForm
          ticket={{ id: ticketId }}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <MaintenanceTicketDetail
          ticketId={ticketId}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
} 
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  property_name?: string;
  unit_number?: string;
}

interface MaintenanceTicketListProps {
  status?: 'open' | 'in_progress' | 'resolved';
}

export function MaintenanceTicketList({ status }: MaintenanceTicketListProps) {
  // Mock data for launch readiness
  const mockTickets: MaintenanceTicket[] = [
    {
      id: '1',
      title: 'Leaky Faucet in Kitchen',
      description: 'The kitchen faucet has been dripping for the past week. Need it fixed asap.',
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      property_name: 'Sunset Apartments',
      unit_number: '101',
    },
    {
      id: '2',
      title: 'Heating System Not Working',
      description: 'The heating system stopped working yesterday. It\'s getting cold.',
      status: 'in_progress',
      priority: 'high',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      property_name: 'Sunset Apartments',
      unit_number: '203',
    },
    {
      id: '3',
      title: 'Broken Window Lock',
      description: 'The window lock in the bedroom is broken and won\'t secure properly.',
      status: 'resolved',
      priority: 'low',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      property_name: 'Sunset Apartments',
      unit_number: '105',
    },
  ];

  const filteredTickets = status 
    ? mockTickets.filter(ticket => ticket.status === status)
    : mockTickets;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (filteredTickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No maintenance tickets found.</p>
            {status && <p>No {status} tickets available.</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority} priority
                  </Badge>
                  {ticket.property_name && (
                    <Badge variant="outline">
                      {ticket.property_name} - Unit {ticket.unit_number}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{ticket.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {ticket.status === 'open' && (
                <Button size="sm">
                  Start Work
                </Button>
              )}
              {ticket.status === 'in_progress' && (
                <Button size="sm">
                  Mark Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
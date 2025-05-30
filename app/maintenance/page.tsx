'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import MaintenanceRequest from '@/components/MaintenanceRequest';

const MotionDiv = motion.div;

export default function MaintenancePage() {
  const { user, role } = useAuth();
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  const tickets = [
    {
      id: '1',
      title: 'Leaking Faucet',
      description: 'Kitchen sink faucet is leaking water onto the counter.',
      status: 'open',
      priority: 'medium',
      created_by: {
        name: 'John Doe',
      },
    },
    // Add more mock tickets as needed
  ];

  const openNewTicketModal = () => {
    setShowNewTicketModal(true);
  };

  const closeNewTicketModal = () => {
    setShowNewTicketModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Maintenance Tickets
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Track and manage maintenance requests
            </p>
          </div>
          {role === 'tenant' && (
            <Button 
              onClick={openNewTicketModal}
              className="bg-nook-purple-600 hover:bg-nook-purple-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}
        </MotionDiv>

        <div className="grid gap-6">
          {tickets.map((ticket, index) => (
            <MotionDiv
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">{ticket.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created by {ticket.created_by.name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4 mr-2 text-nook-purple-500" />
                    Priority: {ticket.priority}
                  </div>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>

        {showNewTicketModal && (
          <MaintenanceRequest
            propertyId="mock-property-id"
            userId={user?.id || ''}
            onRequestSubmitted={closeNewTicketModal}
            isPremium={true}
          />
        )}
      </div>
    </div>
  );
} 
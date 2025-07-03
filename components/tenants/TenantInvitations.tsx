"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Mail, X, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import {
  createTenantInvitation,
  getTenantInvitations,
  cancelTenantInvitation,
  TenantInvitation,
} from '@/lib/services/invitations';
import { getProperties } from '@/lib/services/properties';
import { getUnitsByProperty } from '@/lib/services/units';

interface TenantInvitationsProps {
  organizationId: string;
  userId: string;
}

export function TenantInvitations({
  organizationId,
  userId,
}: TenantInvitationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', organizationId],
    queryFn: () => getProperties({ organization_id: organizationId }),
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: () => propertyId ? getUnitsByProperty(propertyId) : [],
    enabled: !!propertyId,
  });

  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['tenant-invitations', organizationId],
    queryFn: () => getTenantInvitations(organizationId),
  });

  const createInvitation = useMutation({
    mutationFn: () =>
      createTenantInvitation(organizationId, propertyId, unitId, email, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
      setIsOpen(false);
      setEmail('');
      setPropertyId('');
      setUnitId('');
      toast({
        title: 'Invitation Sent',
        description: 'The tenant invitation has been sent successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelInvitation = useMutation({
    mutationFn: (invitationId: string) => cancelTenantInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
      toast({
        title: 'Invitation Cancelled',
        description: 'The tenant invitation has been cancelled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusIcon = (status: TenantInvitation['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: TenantInvitation['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'expired':
        return 'Expired';
    }
  };

  if (propertiesLoading || invitationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tenant Invitations</CardTitle>
            <CardDescription>
              Manage tenant invitations for your properties
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Invite Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Tenant</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new tenant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property</Label>
                  <Select
                    value={propertyId}
                    onValueChange={setPropertyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {propertyId && (
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={unitId}
                      onValueChange={setUnitId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map((unit: { id: string; number: string }) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createInvitation.mutate()}
                  disabled={!email || !propertyId || !unitId}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations?.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">{invitation.email}</p>
                <p className="text-sm text-muted-foreground">
                  Invited on {format(new Date(invitation.created_at), 'PPp')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(invitation.status)}
                  <span className="text-sm">{getStatusText(invitation.status)}</span>
                </div>
                {invitation.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelInvitation.mutate(invitation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {invitations?.length === 0 && (
            <div className="text-center text-muted-foreground">
              No invitations have been sent yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
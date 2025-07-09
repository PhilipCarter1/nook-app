import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { UserRole } from '@/lib/types';

const roleLabels: Record<UserRole, string> = {
  tenant: 'Tenant',
  landlord: 'Landlord',
  super: 'Builder/Super',
  admin: 'Admin',
};

export function RoleSwitcher() {
  const { role, updateRole } = useAuth();

  if (!role) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {roleLabels[role]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(roleLabels).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => updateRole(value as UserRole)}
            className={role === value ? 'bg-accent' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
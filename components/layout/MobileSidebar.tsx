import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainNav } from './MainNav';
import { Menu } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'landlord' | 'property_manager' | 'admin' | 'super' | 'tenant';
}

const navigation = {
  tenant: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Payments', href: '/payments' },
    { name: 'Documents', href: '/documents' },
    { name: 'Maintenance', href: '/maintenance' },
  ],
  landlord: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Properties', href: '/properties' },
    { name: 'Tenants', href: '/tenants' },
    { name: 'Payments', href: '/payments' },
    { name: 'Maintenance', href: '/maintenance' },
  ],
  property_manager: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Properties', href: '/properties' },
    { name: 'Tenants', href: '/tenants' },
    { name: 'Payments', href: '/payments' },
    { name: 'Maintenance', href: '/maintenance' },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Users', href: '/users' },
    { name: 'Settings', href: '/settings' },
  ],
};

export function MobileSidebar({ isOpen, onClose, userRole }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-4">
            <MainNav userRole={userRole} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
} 
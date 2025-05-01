import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'tenant' | 'landlord' | 'admin';
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
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-background shadow-lg">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Nook
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-5 px-2">
          {navigation[userRole].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 
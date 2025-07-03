import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  FileText,
  Settings,
  Home,
  Wrench,
  DollarSign,
  BarChart,
} from 'lucide-react';

interface MainNavProps {
  userRole: 'landlord' | 'admin' | 'super' | 'tenant';
}

const navigation = {
  landlord: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: Building2,
    },
    {
      name: 'Tenants',
      href: '/dashboard/tenants',
      icon: Users,
    },
    {
      name: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: Wrench,
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: DollarSign,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ],
  admin: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: Building2,
    },
    {
      name: 'Tenants',
      href: '/dashboard/tenants',
      icon: Users,
    },
    {
      name: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: Wrench,
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: DollarSign,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ],
  super: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Properties',
      href: '/dashboard/properties',
      icon: Building2,
    },
    {
      name: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: Wrench,
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ],
  tenant: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: Wrench,
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ],
};

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname();
  const items = navigation[userRole];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
} 
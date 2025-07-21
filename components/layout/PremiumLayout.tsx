'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  Wrench, 
  DollarSign, 
  BarChart, 
  Shield, 
  Bell, 
  Search,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PremiumLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Properties',
    href: '/dashboard/properties',
    icon: Building2,
    children: [
      { name: 'All Properties', href: '/dashboard/properties', icon: Building2 },
      { name: 'Add Property', href: '/dashboard/properties/add', icon: Building2 },
      { name: 'Property Settings', href: '/dashboard/properties/settings', icon: Settings },
    ],
  },
  {
    name: 'Tenants',
    href: '/dashboard/tenants',
    icon: Users,
    children: [
      { name: 'All Tenants', href: '/dashboard/tenants', icon: Users },
      { name: 'Invitations', href: '/dashboard/tenants/invitations', icon: Users },
      { name: 'Applications', href: '/dashboard/applications', icon: FileText },
    ],
  },
  {
    name: 'Maintenance',
    href: '/dashboard/maintenance',
    icon: Wrench,
    badge: '3',
  },
  {
    name: 'Payments',
    href: '/dashboard/payments',
    icon: DollarSign,
  },
  {
    name: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
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
];

const adminNavigation: NavigationItem[] = [
  {
    name: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Feature Toggles',
    href: '/admin/feature-toggles',
    icon: Settings,
  },
];

export function PremiumLayout({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  className,
}: PremiumLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getCurrentNavigation = () => {
    if (user?.role === 'admin') {
      return [...navigation, ...adminNavigation];
    }
    return navigation;
  };

  const isActive = (href: string) => {
    return pathname === href || (pathname && pathname.startsWith(href + '/'));
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    return (
      <div key={item.name}>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <a
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
              {
                "bg-nook-purple-100 text-nook-purple-900 dark:bg-nook-purple-900/30 dark:text-nook-purple-100": active,
                "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800": !active,
                "ml-4": level > 0,
              }
            )}
            onClick={hasChildren ? (e) => { e.preventDefault(); toggleExpanded(item.name); } : undefined}
          >
            <item.icon className={cn(
              "w-5 h-5 mr-3 transition-colors",
              {
                "text-nook-purple-600 dark:text-nook-purple-400": active,
                "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300": !active,
              }
            )} />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                { "rotate-180": isExpanded }
              )} />
            )}
          </a>
        </motion.div>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1">
                  {item.children!.map(child => renderNavigationItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      {showSidebar && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Nook
                </span>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {getCurrentNavigation().map(item => renderNavigationItem(item))}
                  </ul>
                </li>
              </ul>
            </nav>

            {/* User menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-nook-purple-100 dark:bg-nook-purple-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-nook-purple-600 dark:text-nook-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
                <PremiumButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <LogOut className="w-4 h-4" />
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800"
            >
              {/* Mobile sidebar content */}
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Nook
                  </span>
                </div>
                <PremiumButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-6 h-6" />
                </PremiumButton>
              </div>
              
              <nav className="px-6 py-4">
                <ul className="space-y-2">
                  {getCurrentNavigation().map(item => renderNavigationItem(item))}
                </ul>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn("lg:pl-72", { "lg:pl-0": !showSidebar })}>
        {/* Header */}
        {showHeader && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
          >
            <PremiumButton
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </PremiumButton>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Search */}
              <div className="relative flex flex-1 items-center">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Theme toggle */}
                <div className="flex items-center space-x-2">
                  <PremiumButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTheme('light')}
                    className={cn(theme === 'light' && "text-nook-purple-600")}
                  >
                    <Sun className="w-4 h-4" />
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTheme('dark')}
                    className={cn(theme === 'dark' && "text-nook-purple-600")}
                  >
                    <Moon className="w-4 h-4" />
                  </PremiumButton>
                  <PremiumButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTheme('system')}
                    className={cn(theme === 'system' && "text-nook-purple-600")}
                  >
                    <Monitor className="w-4 h-4" />
                  </PremiumButton>
                </div>

                {/* Notifications */}
                <PremiumButton
                  variant="ghost"
                  size="icon-sm"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                </PremiumButton>

                {/* Separator */}
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />

                {/* User menu */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-nook-purple-100 dark:bg-nook-purple-900/30 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-nook-purple-600 dark:text-nook-purple-400" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="sr-only">Your profile</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white" aria-hidden="true">
                      {user?.email}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.header>
        )}

        {/* Main content area */}
        <main className={cn("py-6", className)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      © 2024 Nook. All rights reserved.
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Privacy Policy
                    </a>
                    <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Terms of Service
                    </a>
                    <a href="/support" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </div>
    </div>
  );
} 
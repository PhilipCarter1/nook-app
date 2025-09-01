import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

interface TopNavProps {
  userRole: 'landlord' | 'property_manager' | 'admin' | 'super' | 'tenant';
  onMenuClick: () => void;
}

export function TopNav({ userRole, onMenuClick }: TopNavProps) {
  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-background shadow">
      <Button
        variant="ghost"
        size="icon"
        className="border-r px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1"></div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="relative ml-3">
            <Button
              variant="ghost"
              size="icon"
              className="flex max-w-xs items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="sr-only">Open user menu</span>
              <Avatar>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">U</span>
                </div>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Share2, UserPlus, X, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { log } from '@/lib/logger';
interface SharedUser {
  userId: string;
  name: string;
  email: string;
  permission: 'view' | 'edit' | 'sign';
  sharedAt: string;
}

interface DocumentSharingProps {
  documentName: string;
  onShare: (email: string, permission: 'view' | 'edit' | 'sign') => Promise<void>;
  onRemoveShare: (userId: string) => Promise<void>;
  sharedUsers: SharedUser[];
  className?: string;
}

export function DocumentSharing({
  documentName,
  onShare,
  onRemoveShare,
  sharedUsers,
  className,
}: DocumentSharingProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'sign'>('view');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setIsSharing(true);
      await onShare(email, permission);
      setEmail('');
      toast.success('Document shared successfully');
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      await onRemoveShare(userId);
      toast.success('Access removed successfully');
    } catch (error) {
      console.error('Error removing access:', error);
      toast.error('Failed to remove access');
    }
  };

  const getPermissionBadge = (permission: string) => {
    const variants = {
      view: 'default',
      edit: 'secondary',
      sign: 'destructive',
    } as const;

    return (
      <Badge variant={variants[permission as keyof typeof variants]}>
        {permission.charAt(0).toUpperCase() + permission.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Share Document</span>
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Document</Label>
            <p className="text-sm text-muted-foreground mt-1">{documentName}</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="w-[180px]">
                <Label htmlFor="permission">Permission</Label>
                <Select
                  value={permission}
                  onValueChange={(value) => setPermission(value as 'view' | 'edit' | 'sign')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="sign">Sign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Share Document
            </Button>
          </div>

          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Shared With</Label>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.name}</span>
                          {getPermissionBadge(user.permission)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Shared {new Date(user.sharedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveShare(user.userId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
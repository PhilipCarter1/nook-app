'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, User, Clock, FileText, Download, Share2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AuditLogEntry {
  id: string;
  action: 'view' | 'download' | 'share' | 'comment' | 'sign' | 'approve' | 'reject' | 'renew';
  userId: string;
  userName: string;
  timestamp: string;
  details?: {
    ipAddress?: string;
    userAgent?: string;
    targetUser?: string;
    comments?: string;
    version?: number;
  };
}

interface DocumentAuditLogProps {
  logs: AuditLogEntry[];
  className?: string;
}

export function DocumentAuditLog({ logs, className }: DocumentAuditLogProps) {
  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'view':
        return <FileText className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'share':
        return <Share2 className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'sign':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'approve':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'renew':
        return <History className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'view':
        return 'bg-blue-500/10 text-blue-500';
      case 'download':
        return 'bg-purple-500/10 text-purple-500';
      case 'share':
        return 'bg-green-500/10 text-green-500';
      case 'comment':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'sign':
      case 'approve':
        return 'bg-green-500/10 text-green-500';
      case 'reject':
        return 'bg-red-500/10 text-red-500';
      case 'renew':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getActionText = (action: AuditLogEntry['action']) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Audit Log</span>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-4 p-4 rounded-lg border"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn('flex items-center gap-1', getActionColor(log.action))}
                        >
                          {getActionText(log.action)}
                        </Badge>
                        {log.details?.version && (
                          <span className="text-sm text-muted-foreground">
                            Version {log.details.version}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">{log.userName}</span>
                        {log.details?.targetUser && (
                          <span className="text-muted-foreground">
                            {' '}
                            shared with {log.details.targetUser}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  {log.details?.comments && (
                    <p className="text-sm text-muted-foreground">
                      {log.details.comments}
                    </p>
                  )}
                  {(log.details?.ipAddress || log.details?.userAgent) && (
                    <div className="text-xs text-muted-foreground">
                      {log.details.ipAddress && (
                        <p>IP: {log.details.ipAddress}</p>
                      )}
                      {log.details.userAgent && (
                        <p>User Agent: {log.details.userAgent}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 
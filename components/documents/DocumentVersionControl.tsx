'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Clock, User, Download, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentVersion {
  version: number;
  url: string;
  updatedAt: string;
  updatedBy: string;
}

interface DocumentVersionControlProps {
  versions: DocumentVersion[];
  currentVersion: number;
  onVersionSelect: (version: number) => void;
  onDownload: (url: string) => void;
  className?: string;
}

export function DocumentVersionControl({
  versions,
  currentVersion,
  onVersionSelect,
  onDownload,
  className,
}: DocumentVersionControlProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Version History</CardTitle>
        <History className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {versions.map((version) => (
              <div
                key={version.version}
                className={cn(
                  'flex items-start justify-between p-3 rounded-lg border transition-colors',
                  currentVersion === version.version
                    ? 'bg-primary/5 border-primary'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Version {version.version}</span>
                      {currentVersion === version.version && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(new Date(version.updatedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-1 h-3 w-3" />
                        {version.updatedBy}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onVersionSelect(version.version)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(version.url)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 
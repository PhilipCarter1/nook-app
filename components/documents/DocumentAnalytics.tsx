'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Clock, Users, Eye, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentAnalytics {
  views: number;
  downloads: number;
  shares: number;
  lastViewed: string;
  lastDownloaded: string;
  lastShared: string;
  viewers: {
    userId: string;
    name: string;
    lastViewed: string;
  }[];
}

interface DocumentAnalyticsProps {
  analytics: DocumentAnalytics;
  className?: string;
}

export function DocumentAnalytics({ analytics, className }: DocumentAnalyticsProps) {
  const stats = [
    {
      label: 'Views',
      value: analytics.views,
      icon: Eye,
    },
    {
      label: 'Downloads',
      value: analytics.downloads,
      icon: Download,
    },
    {
      label: 'Shares',
      value: analytics.shares,
      icon: Share2,
    },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Analytics</span>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>Last viewed</span>
                </div>
                <span className="text-muted-foreground">
                  {format(new Date(analytics.lastViewed), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Last downloaded</span>
                </div>
                <span className="text-muted-foreground">
                  {format(new Date(analytics.lastDownloaded), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span>Last shared</span>
                </div>
                <span className="text-muted-foreground">
                  {format(new Date(analytics.lastShared), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Recent Viewers</h3>
            <div className="space-y-2">
              {analytics.viewers.map((viewer) => (
                <div
                  key={viewer.userId}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{viewer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(viewer.lastViewed), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
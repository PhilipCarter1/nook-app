"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Document, approveDocument, rejectDocument } from '@/lib/services/documents';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentApprovalProps {
  document: Document;
  onUpdate: () => void;
}

export function DocumentApproval({ document, onUpdate }: DocumentApprovalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveDocument(document.id, document.reviewedBy || '', notes);
      toast.success('Document approved successfully');
      onUpdate();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await rejectDocument(document.id, document.reviewedBy || '', notes);
      toast.success('Document rejected');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg">Document Review</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="capitalize">{document.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Uploaded</p>
              <p>{format(new Date(document.createdAt), 'PPp')}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Document</p>
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Document
            </a>
          </div>

          {document.status === 'pending' && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="h-24"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={loading}
                  className="text-red-500 hover:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </>
          )}

          {document.status !== 'pending' && document.notes && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Review Notes</p>
              <p className="text-sm text-gray-600">{document.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
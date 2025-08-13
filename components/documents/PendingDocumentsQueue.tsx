'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Edit3, 
  Eye, 
  FileText, 
  User, 
  Building, 
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PendingDocument {
  id: string;
  name: string;
  type: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  urgency: 'low' | 'medium' | 'high';
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PendingDocumentsQueueProps {
  documents: PendingDocument[];
  onApprove: (documentId: string) => void;
  onReject: (documentId: string, reason: string) => void;
  onRequestChanges: (documentId: string, changes: string[]) => void;
  onViewDocument: (documentId: string) => void;
  className?: string;
}

export function PendingDocumentsQueue({
  documents,
  onApprove,
  onReject,
  onRequestChanges,
  onViewDocument,
  className = ''
}: PendingDocumentsQueueProps) {
  const router = useRouter();
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null);
  const [requestingChangesDoc, setRequestingChangesDoc] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changeRequests, setChangeRequests] = useState<string[]>(['']);

  const handleViewDocument = (documentId: string) => {
    router.push(`/dashboard/documents/${documentId}`);
  };

  const handleReject = (documentId: string) => {
    if (rejectionReason.trim()) {
      onReject(documentId, rejectionReason);
      setRejectingDoc(null);
      setRejectionReason('');
    }
  };

  const handleRequestChanges = (documentId: string) => {
    const validChanges = changeRequests.filter(change => change.trim());
    if (validChanges.length > 0) {
      onRequestChanges(documentId, validChanges);
      setRequestingChangesDoc(null);
      setChangeRequests(['']);
    }
  };

  const addChangeRequest = () => {
    setChangeRequests([...changeRequests, '']);
  };

  const removeChangeRequest = (index: number) => {
    setChangeRequests(changeRequests.filter((_, i) => i !== index));
  };

  const updateChangeRequest = (index: number, value: string) => {
    const newChanges = [...changeRequests];
    newChanges[index] = value;
    setChangeRequests(newChanges);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <Check className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Card className={`border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
          <FileText className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
          Documents Pending Approval
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Review and approve tenant verification documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-nook-purple-100 dark:bg-nook-purple-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-nook-purple-600 dark:text-nook-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {doc.type.replace('_', ' ')} Document
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{doc.tenantName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{doc.propertyName} - Unit {doc.unitNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(doc.urgency)}>
                      {getUrgencyIcon(doc.urgency)}
                      <span className="ml-1 capitalize">{doc.urgency} Priority</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    onClick={() => handleViewDocument(doc.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    onClick={() => onApprove(doc.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button
                    onClick={() => setRejectingDoc(rejectingDoc === doc.id ? null : doc.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  
                  <Button
                    onClick={() => setRequestingChangesDoc(requestingChangesDoc === doc.id ? null : doc.id)}
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Changes
                  </Button>
                </div>
              </div>
              
              {/* Reject Form */}
              {rejectingDoc === doc.id && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Label htmlFor={`rejection-${doc.id}`} className="text-sm font-medium text-red-700 dark:text-red-300">
                    Reason for Rejection *
                  </Label>
                  <Textarea
                    id={`rejection-${doc.id}`}
                    placeholder="Please provide a reason for rejecting this document..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2 border-red-300 dark:border-red-600 dark:bg-gray-600 dark:text-white"
                    rows={3}
                  />
                  <div className="flex space-x-2 mt-3">
                    <Button
                      onClick={() => handleReject(doc.id)}
                      disabled={!rejectionReason.trim()}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      onClick={() => setRejectingDoc(null)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Request Changes Form */}
              {requestingChangesDoc === doc.id && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Label className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Requested Changes *
                  </Label>
                  <div className="space-y-2 mt-2">
                    {changeRequests.map((change, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder="Describe the change needed..."
                          value={change}
                          onChange={(e) => updateChangeRequest(index, e.target.value)}
                          className="border-yellow-300 dark:border-yellow-600 dark:bg-gray-600 dark:text-white"
                        />
                        {changeRequests.length > 1 && (
                          <Button
                            onClick={() => removeChangeRequest(index)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addChangeRequest}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Add Another Change
                  </Button>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      onClick={() => handleRequestChanges(doc.id)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Request Changes
                    </Button>
                    <Button
                      onClick={() => setRequestingChangesDoc(null)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
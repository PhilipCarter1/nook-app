'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { 
  getTenantDocumentRequests, 
  updateDocumentRequestStatus,
  uploadDocumentRequestFile,
  deleteDocumentRequestFile,
  DocumentRequest,
  DocumentRequestFile
} from '@/lib/services/document-requests';

interface TenantDocumentRequestsProps {
  tenantId: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function TenantDocumentRequests({ tenantId }: TenantDocumentRequestsProps) {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDocumentRequests();
  }, [tenantId]);

  const loadDocumentRequests = async () => {
    try {
      const result = await getTenantDocumentRequests(tenantId);
      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        toast.error(result.error || 'Failed to load document requests');
      }
    } catch (error) {
      console.error('Error loading document requests:', error);
      toast.error('Failed to load document requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedRequest) return;

    setUploadingFile(true);
    try {
      const result = await uploadDocumentRequestFile(selectedRequest.id, file);
      if (result.success) {
        toast.success('File uploaded successfully');
        await loadDocumentRequests();
        setShowUploadModal(false);
      } else {
        toast.error(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitDocuments = async () => {
    if (!selectedRequest) return;

    setSubmittingStatus(true);
    try {
      const result = await updateDocumentRequestStatus(
        selectedRequest.id, 
        'submitted',
        notes
      );
      
      if (result.success) {
        toast.success('Documents submitted successfully');
        await loadDocumentRequests();
        setSelectedRequest(null);
        setNotes('');
      } else {
        toast.error(result.error || 'Failed to submit documents');
      }
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast.error('Failed to submit documents');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const result = await deleteDocumentRequestFile(fileId);
      if (result.success) {
        toast.success('File deleted successfully');
        await loadDocumentRequests();
      } else {
        toast.error(result.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'submitted':
        return <Upload className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return isBefore(new Date(dueDate), new Date());
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nook-purple-600" />
            Document Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Requests</h3>
            <p className="text-gray-500">You don't have any pending document requests at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nook-purple-600" />
            Document Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg">{request.title}</h3>
                      <Badge className={STATUS_COLORS[request.status]}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                      <Badge className={PRIORITY_COLORS[request.priority]}>
                        {request.priority}
                      </Badge>
                    </div>
                    
                    {request.description && (
                      <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Property: {request.property?.name}</span>
                      {request.due_date && (
                        <span className={`flex items-center gap-1 ${
                          isOverdue(request.due_date) ? 'text-red-600' : ''
                        }`}>
                          <Clock className="h-3 w-3" />
                          Due: {format(new Date(request.due_date), 'MMM dd, yyyy')}
                          {isOverdue(request.due_date) && ' (Overdue)'}
                        </span>
                      )}
                      <span>Created: {format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                    </div>

                    {request.files && request.files.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {request.files.length} file(s) uploaded
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-nook-purple-600" />
              {selectedRequest?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={STATUS_COLORS[selectedRequest.status]}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <div className="mt-1">
                    <Badge className={PRIORITY_COLORS[selectedRequest.priority]}>
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Property</Label>
                  <p className="mt-1 text-sm">{selectedRequest.property?.name}</p>
                </div>
                {selectedRequest.due_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                    <p className={`mt-1 text-sm ${
                      isOverdue(selectedRequest.due_date) ? 'text-red-600' : ''
                    }`}>
                      {format(new Date(selectedRequest.due_date), 'MMM dd, yyyy')}
                      {isOverdue(selectedRequest.due_date) && ' (Overdue)'}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1 text-sm">{selectedRequest.description}</p>
                </div>
              )}

              {/* Uploaded Files */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-500">Uploaded Files</Label>
                  {selectedRequest.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                      className="bg-nook-purple-600 hover:bg-nook-purple-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload File
                    </Button>
                  )}
                </div>

                {selectedRequest.files && selectedRequest.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{file.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {file.file_size && `${(file.file_size / 1024).toFixed(1)} KB`} • 
                              {format(new Date(file.uploaded_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {selectedRequest.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No files uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Submit Section */}
              {selectedRequest.status === 'pending' && selectedRequest.files && selectedRequest.files.length > 0 && (
                <div className="border-t pt-4">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-500">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional information..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button
                    onClick={handleSubmitDocuments}
                    disabled={submittingStatus}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    {submittingStatus ? 'Submitting...' : 'Submit Documents'}
                  </Button>
                </div>
              )}

              {/* Landlord Notes */}
              {selectedRequest.notes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500">Landlord Notes</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={uploadingFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {uploadingFile && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nook-purple-600"></div>
                <span className="ml-2 text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

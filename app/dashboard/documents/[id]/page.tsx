'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Edit3, 
  Download, 
  Eye, 
  FileText, 
  User, 
  Building, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getDocumentDetails, approveDocument, rejectDocument, requestDocumentChanges, Document } from '@/lib/services/documents';
import { toast } from 'sonner';

export default function DocumentReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changeRequests, setChangeRequests] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');

  const documentId = params?.id as string;

  useEffect(() => {
    if (documentId && user) {
      loadDocument();
    }
  }, [documentId, user]);

  const loadDocument = async () => {
    try {
      const result = await getDocumentDetails(documentId);
      if (result.success && result.document) {
        setDocumentData(result.document);
      } else {
        toast.error(result.error || 'Failed to load document');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user || !documentData) return;

    setActionLoading('approve');
    try {
      const result = await approveDocument(documentData.id, user.id, notes);
      if (result.success) {
        toast.success('Document approved successfully');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to approve document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!user || !documentData || !rejectionReason.trim()) return;

    setActionLoading('reject');
    try {
      const result = await rejectDocument(documentData.id, user.id, rejectionReason);
      if (result.success) {
        toast.success('Document rejected');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!user || !documentData) return;

    const validChanges = changeRequests.filter(change => change.trim());
    if (validChanges.length === 0) {
      toast.error('Please provide at least one change request');
      return;
    }

    setActionLoading('changes');
    try {
      const result = await requestDocumentChanges(documentData.id, user.id, validChanges);
      if (result.success) {
        toast.success('Changes requested successfully');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to request changes');
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
    } finally {
      setActionLoading(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">The document you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => router.push('/dashboard')} className="bg-nook-purple-600 hover:bg-nook-purple-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Review</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Review and approve tenant documents</p>
              </div>
            </div>
            <Badge className={getStatusColor(documentData.status)}>
              {getStatusIcon(documentData.status)}
              <span className="ml-2 capitalize">{documentData.status}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
                  Document Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{documentData.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {documentData.metadata?.mimeType || 'Document'} • {documentData.metadata?.size ? `${Math.round(documentData.metadata.size / 1024)} KB` : 'Unknown size'}
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(documentData.url, '_blank')}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const link = window.document.createElement('a');
                        link.href = documentData.url;
                        link.download = documentData.name;
                        link.click();
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Details & Actions */}
          <div className="space-y-6">
            {/* Document Information */}
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold dark:text-white">Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{documentData.tenantName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{documentData.tenantEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{documentData.propertyName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unit {documentData.unitNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Uploaded</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(documentData.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Document Type</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {documentData.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            {documentData.status === 'pending' && (
              <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">Review Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium dark:text-white">Review Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this document..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading === 'approve' ? 'Approving...' : 'Approve Document'}
                    </Button>
                    
                    <Button 
                      onClick={() => setShowRejectForm(!showRejectForm)}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Document
                    </Button>
                    
                    <Button 
                      onClick={() => setShowChangesForm(!showChangesForm)}
                      variant="outline"
                      className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Request Changes
                    </Button>
                  </div>

                  {/* Reject Form */}
                  {showRejectForm && (
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                      <Label htmlFor="rejectionReason" className="text-sm font-medium text-red-700 dark:text-red-300">
                        Reason for Rejection *
                      </Label>
                      <Textarea
                        id="rejectionReason"
                        placeholder="Please provide a reason for rejecting this document..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-2 border-red-300 dark:border-red-600 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          onClick={handleReject}
                          disabled={!rejectionReason.trim() || actionLoading !== null}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                        <Button 
                          onClick={() => setShowRejectForm(false)}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Changes Form */}
                  {showChangesForm && (
                    <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
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
                              className="border-yellow-300 dark:border-yellow-600 dark:bg-gray-700 dark:text-white"
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
                        <Edit3 className="h-4 w-4 mr-2" />
                        Add Another Change
                      </Button>
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          onClick={handleRequestChanges}
                          disabled={actionLoading !== null}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          {actionLoading === 'changes' ? 'Requesting...' : 'Request Changes'}
                        </Button>
                        <Button 
                          onClick={() => setShowChangesForm(false)}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Document History */}
            {documentData.reviewedBy && (
              <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold dark:text-white">Review History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Reviewed by</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{documentData.reviewedBy}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Reviewed on</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {documentData.reviewedAt ? new Date(documentData.reviewedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {documentData.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Notes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{documentData.notes}</p>
                    </div>
                  )}
                  
                  {documentData.rejectionReason && (
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Rejection Reason</p>
                      <p className="text-xs text-red-600 dark:text-red-400">{documentData.rejectionReason}</p>
                    </div>
                  )}
                  
                  {documentData.changeRequests && documentData.changeRequests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Requested Changes</p>
                      <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                        {documentData.changeRequests.map((change, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
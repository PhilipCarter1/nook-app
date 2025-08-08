'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Share2, Clock, User, CheckCircle2 } from 'lucide-react';
import { DocumentVersionControl } from '@/components/documents/DocumentVersionControl';
import { DigitalSignature } from '@/components/documents/DigitalSignature';
import { DocumentSharing } from '@/components/documents/DocumentSharing';
import { DocumentAnalytics } from '@/components/documents/DocumentAnalytics';
import DocumentPreview from '@/components/documents/DocumentPreview';
import { getClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { useParams } from 'next/navigation';
import { DocumentComments } from '@/components/documents/DocumentComments';
import { DocumentWorkflow } from '@/components/documents/DocumentWorkflow';
import { DocumentExpiration } from '@/components/documents/DocumentExpiration';
import { DocumentAuditLog } from '@/components/documents/DocumentAuditLog';
import { validateDocument, getLegalRecommendations } from '@/lib/services/legal-assistant';
import { sendNotification } from '@/lib/services/notifications';
import { log } from '@/lib/logger';
interface Document {
  id: string;
  name: string;
  type: string;
  state: string;
  version: number;
  status: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  category: string;
  description: string;
  metadata: {
    mimeType: string;
    pages: number;
    expirationDate: string | null;
    size: number;
    category: string;
    tags: string[];
  };
  signatures: {
    userId: string;
    signedAt: string;
    signatureType: string;
    signatureData: string;
  }[];
  sharedWith: {
    userId: string;
    permission: 'view' | 'edit' | 'sign';
    sharedAt: string;
  }[];
  comments: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    pageNumber?: number;
    position?: { x: number; y: number };
    createdAt: string;
    updatedAt: string;
  }[];
  workflow: {
    steps: {
      id: string;
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'rejected';
      assignedTo: string;
      dueDate: string;
      completedAt?: string;
      comments?: string;
      validationResults?: {
        isValid: boolean;
        issues: string[];
        stateCompliance: {
          state: string;
          isCompliant: boolean;
          requirements: string[];
        };
      };
    }[];
  };
  analytics: {
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
  };
  auditLogs: {
    id: string;
    action: 'view' | 'sign' | 'download' | 'share' | 'comment' | 'approve' | 'reject' | 'renew';
    userId: string;
    userName: string;
    timestamp: string;
    details?: {
      stepId?: string;
      stepName?: string;
      reason?: string;
      version?: number;
      comments?: string;
    };
  }[];
  previousVersions: {
    version: number;
    url: string;
    updatedAt: string;
    updatedBy: string;
  }[];
  created_at: string;
  updated_at: string;
}

function getUserName(user: any): string {
  return typeof user === 'object' && user && typeof user.name === 'string' && user.name
    ? user.name
    : (user && user.email) || 'Unknown User';
}

export default function DocumentPage() {
  const params = useParams();
  const documentId = params?.id as string;
  const { user, role } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      setDocument(data);
    } catch (error) {
      log.error('Error fetching document:', error as Error);
      toast.error('Failed to fetch document');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!document || !user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          analytics: {
            ...document.analytics,
            views: (document.analytics?.views || 0) + 1,
            lastViewed: new Date().toISOString(),
            viewers: [
              ...(document.analytics?.viewers || []),
              {
                userId: user.id,
                name: getUserName(user),
                lastViewed: new Date().toISOString(),
              },
            ],
          },
          auditLogs: [
            ...(document.auditLogs || []),
            {
              id: crypto.randomUUID(),
              action: 'view',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                ipAddress: window.location.hostname,
                userAgent: window.navigator.userAgent,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;
    } catch (error) {
      log.error('Error updating view count:', error as Error);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    if (!document || !user) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Update download analytics and audit log
      const { error } = await supabase
        .from('documents')
        .update({
          analytics: {
            ...document.analytics,
            downloads: (document.analytics?.downloads || 0) + 1,
            lastDownloaded: new Date().toISOString(),
          },
          auditLogs: [
            ...(document.auditLogs || []),
            {
              id: crypto.randomUUID(),
              action: 'download',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                ipAddress: window.location.hostname,
                userAgent: window.navigator.userAgent,
                version: document.version,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;
    } catch (error) {
      log.error('Error downloading document:', error as Error);
      toast.error('Failed to download document');
    }
  };

  const handleSign = async (signatureData: string) => {
    if (!document || !user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          signatures: [
            ...document.signatures,
            {
              userId: user.id,
              signedAt: new Date().toISOString(),
              signatureType: 'digital',
              signatureData,
            },
          ],
          auditLogs: [
            ...(document.auditLogs || []),
            {
              id: crypto.randomUUID(),
              action: 'sign',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                version: document.version,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;

      await fetchDocument();
      toast.success('Document signed successfully');
    } catch (error) {
      log.error('Error signing document:', error as Error);
      toast.error('Failed to sign document');
    }
  };

  const handleShare = async (email: string, permission: 'view' | 'edit' | 'sign') => {
    if (!document || !user) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('documents')
        .update({
          sharedWith: [
            ...document.sharedWith,
            {
              userId: userData.id,
              permission,
              sharedAt: new Date().toISOString(),
            },
          ],
          analytics: {
            ...document.analytics,
            shares: (document.analytics?.shares || 0) + 1,
            lastShared: new Date().toISOString(),
          },
          auditLogs: [
            ...(document.auditLogs || []),
            {
              id: crypto.randomUUID(),
              action: 'share',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                targetUser: userData.name || email,
                version: document.version,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;

      await fetchDocument();
      toast.success('Document shared successfully');
    } catch (error) {
      log.error('Error sharing document:', error as Error);
      toast.error('Failed to share document');
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    if (!document) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('documents')
        .update({
          sharedWith: document.sharedWith.filter((share) => share.userId !== userId),
          auditLogs: [
            ...(document.auditLogs || []),
            {
              id: crypto.randomUUID(),
              action: 'share',
              userId: user?.id || '',
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                targetUser: userData.name,
                comments: 'Access removed',
                version: document.version,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;

      await fetchDocument();
      toast.success('Access removed successfully');
    } catch (error) {
      log.error('Error removing access:', error as Error);
      toast.error('Failed to remove access');
    }
  };

  const handleAddComment = async (comment: Omit<Document['comments'][0], 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!document) return;

    const newComment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedComments = [...(document.comments || []), newComment];

    const { error } = await supabase
      .from('documents')
      .update({
        comments: updatedComments,
        auditLogs: [
          ...(document.auditLogs || []),
          {
            id: crypto.randomUUID(),
            action: 'comment',
            userId: user?.id || '',
            userName: getUserName(user),
            timestamp: new Date().toISOString(),
            details: {
              comments: comment.content,
              version: document.version,
            },
          },
        ],
      })
      .eq('id', document.id);

    if (error) {
      log.error('Error adding comment:', error as Error);
      throw error;
    }

    setDocument((prev) => prev ? { ...prev, comments: updatedComments } : null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!document) return;

    const comment = document.comments.find((c) => c.id === commentId);
    const updatedComments = document.comments.filter((c) => c.id !== commentId);

    const { error } = await supabase
      .from('documents')
      .update({
        comments: updatedComments,
        auditLogs: [
          ...(document.auditLogs || []),
          {
            id: crypto.randomUUID(),
            action: 'comment',
            userId: user?.id || '',
            userName: getUserName(user),
            timestamp: new Date().toISOString(),
            details: {
              comments: `Deleted comment: ${comment?.content}`,
              version: document.version,
            },
          },
        ],
      })
      .eq('id', document.id);

    if (error) {
      log.error('Error deleting comment:', error as Error);
      throw error;
    }

    setDocument((prev) => prev ? { ...prev, comments: updatedComments } : null);
  };

  const handleValidate = async (stepId: string) => {
    if (!document) return;
    
    try {
      const validationResult = await validateDocument(
        document.id,
        document.state || 'CA', // Default to CA if not specified
        document.type
      );

      // Update workflow step with validation results
      const updatedSteps = document.workflow.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            validationResults: validationResult,
          };
        }
        return step;
      });

      // Update document in database
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          workflow: {
            ...document.workflow,
            steps: updatedSteps,
          },
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      // Refresh document data
      fetchDocument();
    } catch (error) {
      log.error('Error validating document:', error as Error);
      toast.error('Failed to validate document');
    }
  };

  const handleApproveStep = async (stepId: string) => {
    if (!document || !user) return;

    try {
      const updatedSteps = document.workflow.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
        }
        return step;
      });

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          workflow: {
            ...document.workflow,
            steps: updatedSteps,
          },
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      // Add to audit log
      const { error: auditError } = await supabase
        .from('documents')
        .update({
          auditLogs: [
            ...document.auditLogs,
            {
              id: crypto.randomUUID(),
              action: 'approve',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                stepId,
                stepName: document.workflow.steps.find((s) => s.id === stepId)?.name,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (auditError) throw auditError;

      // Send notification
      const assignedTo = document.workflow.steps.find((s) => s.id === stepId)?.assignedTo;
      if (assignedTo) {
        await sendNotification(assignedTo, {
          type: 'workflow',
          title: 'Document Step Approved',
          message: `Step "${document.workflow.steps.find((s) => s.id === stepId)?.name}" has been approved`,
          link: `/dashboard/documents/${document.id}`,
        });
      }

      // Refresh document data
      fetchDocument();
    } catch (error) {
      log.error('Error approving step:', error as Error);
      toast.error('Failed to approve step');
    }
  };

  const handleRejectStep = async (stepId: string, reason: string) => {
    if (!document || !user) return;

    try {
      const updatedSteps = document.workflow.steps.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            status: 'rejected',
            comments: reason,
          };
        }
        return step;
      });

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          workflow: {
            ...document.workflow,
            steps: updatedSteps,
          },
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      // Add to audit log
      const { error: auditError } = await supabase
        .from('documents')
        .update({
          auditLogs: [
            ...document.auditLogs,
            {
              id: crypto.randomUUID(),
              action: 'reject',
              userId: user.id,
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                stepId,
                stepName: document.workflow.steps.find((s) => s.id === stepId)?.name,
                reason,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (auditError) throw auditError;

      // Send notification
      const assignedTo = document.workflow.steps.find((s) => s.id === stepId)?.assignedTo;
      if (assignedTo) {
        await sendNotification(assignedTo, {
          type: 'workflow',
          title: 'Document Step Rejected',
          message: `Step "${document.workflow.steps.find((s) => s.id === stepId)?.name}" has been rejected: ${reason}`,
          link: `/dashboard/documents/${document.id}`,
        });
      }

      // Refresh document data
      fetchDocument();
    } catch (error) {
      log.error('Error rejecting step:', error as Error);
      toast.error('Failed to reject step');
    }
  };

  const handleRenew = async () => {
    if (!document) return;

    try {
      const newExpirationDate = new Date(document.metadata.expirationDate || '');
      newExpirationDate.setDate(newExpirationDate.getDate() + 365); // Renew for 1 year

      const { error } = await supabase
        .from('documents')
        .update({
          metadata: {
            ...document.metadata,
            expirationDate: newExpirationDate.toISOString(),
          },
          auditLogs: [
            ...document.auditLogs,
            {
              id: crypto.randomUUID(),
              action: 'renew',
              userId: user?.id || '',
              userName: getUserName(user),
              timestamp: new Date().toISOString(),
              details: {
                version: document.version,
              },
            },
          ],
        })
        .eq('id', document.id);

      if (error) throw error;

      await fetchDocument();
    } catch (error) {
      log.error('Error renewing document:', error as Error);
      throw error;
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!document) return;

    try {
      const updatedTags = [...document.tags, tag];
      const { error } = await supabase
        .from('documents')
        .update({
          tags: updatedTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (error) throw error;

      setDocument((prev) => prev ? { ...prev, tags: updatedTags } : null);
    } catch (error) {
      log.error('Error adding tag:', error as Error);
      toast.error('Failed to add tag');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
          <p className="text-gray-500">
            The document you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const hasSigned = document.signatures.some((signature) => signature.userId === user?.id);
  const canSign = !hasSigned && (role === 'landlord' || role === 'tenant');
  const canShare = role === 'landlord' || role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{document.name}</h1>
          <p className="text-muted-foreground">
            Version {document.version} • Last updated {new Date(document.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleDownload(document.url, document.name)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {canShare && (
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DocumentPreview
          url={document.url}
          type={document.type}
          name={document.name}
          className="md:col-span-2"
          onView={handleView}
        />

        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{document.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Size</p>
                <p>{(document.size / 1024).toFixed(2)} KB</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pages</p>
                <p>{document.metadata.pages}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{document.category}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {document.signatures.map((signature) => (
              <div key={signature.userId} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">User ID: {signature.userId}</p>
                  <p className="text-sm text-muted-foreground">
                    Signed on {new Date(signature.signedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {canSign && (
              <DigitalSignature
                documentName={document.name}
                onSign={handleSign}
                onCancel={() => {}}
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>

        {canShare && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Shared Access</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentSharing
                documentName={document.name}
                sharedUsers={document.sharedWith.map(user => ({
                  ...user,
                  name: 'User', // This should be fetched from the users table
                  email: 'user@example.com', // This should be fetched from the users table
                }))}
                onShare={handleShare}
                onRemoveShare={handleRemoveAccess}
              />
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentVersionControl
              versions={document.previousVersions || []}
              currentVersion={document.version}
              onVersionSelect={(version) => {
                const versionDoc = document.previousVersions?.find((v) => v.version === Number(version));
                if (versionDoc) {
                  handleDownload(versionDoc.url, `${document.name} (v${version})`);
                }
              }}
              onDownload={(version) => {
                const versionDoc = document.previousVersions?.find((v) => v.version === Number(version));
                if (versionDoc) {
                  handleDownload(versionDoc.url, `${document.name} (v${version})`);
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentAnalytics
              analytics={document.analytics || {
                views: 0,
                downloads: 0,
                shares: 0,
                lastViewed: document.created_at,
                lastDownloaded: document.created_at,
                lastShared: document.created_at,
                viewers: [],
              }}
            />
          </CardContent>
        </Card>

        <DocumentComments
          comments={document.comments || []}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          currentUser={{
            id: user?.id || '',
            name: getUserName(user),
          }}
        />

        <DocumentWorkflow
          steps={document.workflow?.steps || []}
          onApprove={handleApproveStep}
          onReject={handleRejectStep}
          onValidate={handleValidate}
        />
        <DocumentExpiration
          expirationDate={document.metadata.expirationDate}
          onRenew={handleRenew}
          renewalPeriod={365} // 1 year
        />
        <DocumentAuditLog
          logs={document.auditLogs || []}
          className="md:col-span-2"
        />
      </div>
    </div>
  );
} 
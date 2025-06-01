'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getClient } from '@/lib/supabase/client';
import { File, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    name: string;
    address: string;
  };
}

export default function DocumentsPage() {
  const { role } = useAuth();
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    status: 'all',
    search: '',
  });
  const supabase = getClient();

  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          user:users(id, name, email),
          property:properties(name, address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === documentId ? { ...doc, status: newStatus } : doc
        )
      );

      // Create notification for the user
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        await supabase.from('notifications').insert({
          user_id: document.user.id,
          type: 'document_status',
          title: 'Document Status Updated',
          message: `Your document "${document.name}" has been ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = filter.status === 'all' || doc.status === filter.status;
    const matchesSearch = doc.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                         doc.user.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                         doc.property.name.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (role !== 'landlord' && role !== 'admin' && role !== 'builder_super') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Review</h1>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="max-w-sm"
          />
        </div>
        <Select
          value={filter.status}
          onValueChange={(value) => setFilter({ ...filter, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <File className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <div className="space-y-1 mt-1">
                      <p className="text-sm text-gray-500">
                        Uploaded by {doc.user.name} ({doc.user.email})
                      </p>
                      <p className="text-sm text-gray-500">
                        Property: {doc.property.name} - {doc.property.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.status)}
                    <span className="text-sm capitalize">{doc.status}</span>
                  </div>
                  {doc.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(doc.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(doc.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
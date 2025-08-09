'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Download, 
  Search,
  Calendar,
  User,
  Building,
  Eye,
  Trash2,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'other';
  size: number;
  uploaded_by: string;
  property_id: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'other',
    property_id: '',
    tenant_id: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        toast.error('Failed to load documents');
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const supabase = createClient();
      
      // Upload file to storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast.error('Failed to upload file');
        return;
      }

      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          name: uploadData.name || selectedFile.name,
          type: uploadData.type,
          size: selectedFile.size,
          property_id: uploadData.property_id,
          tenant_id: uploadData.tenant_id || null,
          uploaded_by: 'current_user_id' // This should come from auth
        }]);

      if (insertError) {
        toast.error('Failed to create document record');
        return;
      }

      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setSelectedFile(null);
      setUploadData({
        name: '',
        type: 'other',
        property_id: '',
        tenant_id: ''
      });
      loadDocuments();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload document');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lease': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-orange-100 text-orange-800';
      case 'receipt': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/admin')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Store and manage important documents</p>
            </div>
          </div>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="lease">Leases</SelectItem>
                  <SelectItem value="contract">Contracts</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="receipt">Receipts</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                    <Badge className={getTypeColor(doc.type)}>
                      {doc.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {formatFileSize(doc.size)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Uploaded by User #{doc.uploaded_by}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Property #{doc.property_id}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first document.'}
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Document Name</Label>
                    <Input
                      id="name"
                      value={uploadData.name}
                      onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                      placeholder="Enter document name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Document Type</Label>
                    <Select value={uploadData.type} onValueChange={(value) => setUploadData({...uploadData, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">Lease Agreement</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="receipt">Receipt</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="property_id">Property ID</Label>
                    <Input
                      id="property_id"
                      value={uploadData.property_id}
                      onChange={(e) => setUploadData({...uploadData, property_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant_id">Tenant ID (Optional)</Label>
                    <Input
                      id="tenant_id"
                      value={uploadData.tenant_id}
                      onChange={(e) => setUploadData({...uploadData, tenant_id: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Upload Document
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 
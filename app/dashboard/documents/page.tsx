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
  ArrowLeft,
  X
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
      // TEMPORARY: Use simulated data
      setDocuments([
        {
          id: '1',
          name: 'Lease Agreement - Unit 3A',
          type: 'lease',
          size: 2048576,
          uploaded_by: 'John Smith',
          property_id: '1',
          tenant_id: '1',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Monthly Invoice - February 2024',
          type: 'invoice',
          size: 512000,
          uploaded_by: 'Sarah Johnson',
          property_id: '2',
          tenant_id: '2',
          created_at: '2024-02-01T14:20:00Z',
          updated_at: '2024-02-01T14:20:00Z'
        },
        {
          id: '3',
          name: 'Property Insurance Certificate',
          type: 'contract',
          size: 1024000,
          uploaded_by: 'Admin',
          property_id: '1',
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-10T09:15:00Z'
        }
      ]);
      
      /* Comment out actual Supabase code for now
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
      */
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
      // TEMPORARY: Add to local state
      const document = {
        id: Date.now().toString(),
        name: uploadData.name || selectedFile.name,
        type: uploadData.type as 'lease' | 'contract' | 'invoice' | 'receipt' | 'other',
        size: selectedFile.size,
        uploaded_by: 'Current User',
        property_id: uploadData.property_id || '1',
        tenant_id: uploadData.tenant_id || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDocuments([document, ...documents]);
      setShowUpload(false);
      setSelectedFile(null);
      setUploadData({
        name: '',
        type: 'other',
        property_id: '',
        tenant_id: ''
      });
      toast.success('Document uploaded successfully!');
      
      /* Comment out actual Supabase code for now
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
          uploaded_by: 'current_user',
          property_id: uploadData.property_id,
          tenant_id: uploadData.tenant_id || null
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
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload document');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lease':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'contract':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200';
      case 'invoice':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'receipt':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'other':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(document =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-nook-purple-700 tracking-tight">Documents</h1>
                <p className="text-gray-600 mt-2">Store and manage important documents</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                <span className="text-sm font-medium text-nook-purple-600">Total Documents:</span>
                <span className="ml-2 text-lg font-bold text-nook-purple-700">{documents.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-nook-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-nook-purple-700 group-hover:text-nook-purple-600 transition-colors duration-200">{document.name}</h3>
                          <Badge className={`${getTypeColor(document.type)} font-semibold px-3 py-1`}>
                            {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-nook-purple-500" />
                            {new Date(document.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-nook-purple-500" />
                            {document.uploaded_by}
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-nook-purple-500" />
                            Property #{document.property_id}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-nook-purple-500" />
                            {formatFileSize(document.size)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-nook-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-nook-purple-700 mb-3">No documents found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Get started by uploading your first document to begin organizing your important files</p>
              <Button 
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-nook-purple-700">Upload Document</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpload(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleFileUpload} className="space-y-6">
                <div>
                  <Label htmlFor="file" className="text-sm font-semibold text-gray-700 mb-2 block">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Document Name</Label>
                  <Input
                    id="name"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                    placeholder="Enter document name"
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 mb-2 block">Document Type</Label>
                  <Select value={uploadData.type} onValueChange={(value) => setUploadData({...uploadData, type: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Upload Document
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUpload(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
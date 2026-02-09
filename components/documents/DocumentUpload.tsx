'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, File, X } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File, metadata: DocumentMetadata) => Promise<void>;
  onCancel: () => void;
}

interface DocumentMetadata {
  type: string;
  name: string;
  description?: string;
}

export function DocumentUpload({ onUpload, onCancel }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    type: '',
    name: '',
    description: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!metadata.name) {
        setMetadata(prev => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !metadata.type || !metadata.name) {
      toast.error('Please fill in all required fields and select a file.');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading document...');
    
    try {
      await onUpload(file, metadata);
      toast.dismiss(loadingToast);
      toast.success('Document uploaded successfully.');
      setFile(null);
      setMetadata({ type: '', name: '', description: '' });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Upload Document</h3>
        <p className="text-sm text-muted-foreground">
          Upload a new document to your property management system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Document File</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex-1"
            />
            {file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span>{file.name}</span>
              <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Document Type</Label>
          <Select
            value={metadata.type}
            onValueChange={(value) => setMetadata(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lease">Lease Agreement</SelectItem>
              <SelectItem value="application">Rental Application</SelectItem>
              <SelectItem value="maintenance">Maintenance Report</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Document Name</Label>
          <Input
            id="name"
            value={metadata.name}
            onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter document name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={metadata.description}
            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter document description"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!file || !metadata.type || !metadata.name || isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase/client';
import { Upload, X, CheckCircle2, XCircle } from 'lucide-react';

interface DocumentUploadProps {
  type: 'id' | 'income';
  onUpload: (file: File) => void;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function DocumentUpload({ type, onUpload, status }: DocumentUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, JPEG, or PNG file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    onUpload(file);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'approved':
        return 'Document approved';
      case 'rejected':
        return 'Document rejected';
      case 'pending':
        return 'Document pending review';
      default:
        return 'Upload document';
    }
  };

  return (
    <Card className={`p-4 ${dragActive ? 'border-primary' : ''}`}>
      <div
        className="relative"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
        />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              {type === 'id' ? 'Proof of ID' : 'Proof of Income'}
            </h3>
            <p className="text-sm text-gray-500">
              Upload a PDF, JPEG, or PNG file (max 5MB)
            </p>
          </div>
          {getStatusIcon()}
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {getStatusText()}
          </Button>
        </div>
      </div>
    </Card>
  );
} 
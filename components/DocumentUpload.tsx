'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase/client';
import { Upload, X } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
  acceptedFileTypes: string[];
  propertyId: string;
  userId: string;
}

export default function DocumentUpload({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes,
  propertyId,
  userId,
}: DocumentUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const supabase = getClient();

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

  const handleFile = (selectedFile: File) => {
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      onUploadError(new Error('Invalid file type'));
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      onUploadError(new Error('File size too large'));
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${propertyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      setFile(null);
    } catch (error) {
      onUploadError(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="relative"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Card className={`border-2 border-dashed ${dragActive ? 'border-primary' : 'border-gray-300'}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-gray-50"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept={acceptedFileTypes.join(',')}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')} up to 5MB
              </p>
            </div>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between rounded-md bg-gray-50 p-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
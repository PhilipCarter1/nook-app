'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { log } from '@/lib/logger';
import { useDropzone } from 'react-dropzone';
interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: any) => void;
  acceptedFileTypes?: string[];
  propertyId?: string;
  userId?: string;
  type?: string;
  status?: string;
}

export function DocumentUpload({
  onUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes,
  propertyId,
  userId,
  type,
  status,
}: DocumentUploadProps) {
  const [uploading, setUploading] = React.useState(false);

  const effectiveAccept = acceptedFileTypes
    ? acceptedFileTypes.reduce((acc, type) => {
        if (type === 'application/pdf') acc['application/pdf'] = ['.pdf'];
        if (type === 'image/jpeg' || type === 'image/png') acc['image/*'] = ['.png', '.jpg', '.jpeg'];
        return acc;
      }, {} as Record<string, string[]>)
    : accept;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: effectiveAccept,
    maxSize,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PDF or image file.');
      } else {
        toast.error('Error uploading file. Please try again.');
      }
      if (onUploadError) onUploadError(error);
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        await onUpload(file);
        toast.success('File uploaded successfully');
        if (onUploadComplete) onUploadComplete('uploaded-file-url'); // Replace with actual URL if available
      } catch (error) {
        log.error('Error uploading file:', error as Error);
        toast.error('Failed to upload file');
        if (onUploadError) onUploadError(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      } ${className}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop a file here, or click to select'}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={(e) => e.stopPropagation()}
        >
          {uploading ? 'Uploading...' : 'Select File'}
        </Button>
      </div>
    </div>
  );
} 
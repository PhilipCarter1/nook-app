"use client";

import { useState, useRef } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => void;
  className?: string;
}

export function FileUpload({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUpload,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return false;
    }

    if (accept) {
      const acceptedTypes = accept.split(',');
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;

      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }
        return fileType.match(new RegExp(type.replace('*', '.*')));
      });

      if (!isValidType) {
        setError(`File type must be one of: ${accept}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-6 text-center',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        error ? 'border-destructive' : '',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Drag and drop your file here, or{' '}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            browse
          </Button>
        </p>
        {accept && (
          <p className="text-xs text-muted-foreground">
            Accepted formats: {accept}
          </p>
        )}
        {maxSize && (
          <p className="text-xs text-muted-foreground">
            Max size: {maxSize / 1024 / 1024}MB
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>
    </div>
  );
} 
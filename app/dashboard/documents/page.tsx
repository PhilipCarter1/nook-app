'use client';

import React from 'react';
import { DocumentUpload } from '@/components/DocumentUpload';
import { DocumentTemplate } from '@/components/documents/DocumentTemplate';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const handleUpload = async (file: File) => {
    toast.success('Document uploaded successfully!');
  };

  const handleSave = async (template: any) => {
    toast.success('Document template saved!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Documents</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DocumentUpload onUpload={handleUpload} />
          <DocumentTemplate onSave={handleSave} />
        </div>
      </div>
    </div>
  );
} 
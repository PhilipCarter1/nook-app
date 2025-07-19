'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Plus, Search, Tag, Trash2, Edit2 } from 'lucide-react';
import { DocumentTemplate } from '@/components/documents/DocumentTemplate';
import { getClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { log } from '@/lib/logger';
interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: {
    name: string;
    type: 'text' | 'date' | 'number' | 'select';
    required: boolean;
    options?: string[];
  }[];
  metadata: {
    category: string;
    tags: string[];
    requiredSignatures: string[];
    expirationDays: number;
  };
  created_at: string;
  updated_at: string;
}

export default function DocumentTemplatesPage() {
  const { role } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const supabase = getClient();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      log.error('Error fetching templates:', error as Error);
      toast.error('Failed to fetch templates');
    }
  };

  const handleSaveTemplate = async (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedTemplate) {
        const { error } = await supabase
          .from('document_templates')
          .update({
            ...template,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('document_templates')
          .insert({
            ...template,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      await fetchTemplates();
      setSelectedTemplate(null);
      setShowNewTemplate(false);
      toast.success('Template saved successfully');
    } catch (error) {
      log.error('Error saving template:', error as Error);
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      await fetchTemplates();
      setSelectedTemplate(null);
      toast.success('Template deleted successfully');
    } catch (error) {
      log.error('Error deleting template:', error as Error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.metadata.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.metadata.category)))];

  if (role !== 'landlord' && role !== 'admin') {
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
        <h1 className="text-3xl font-bold">Document Templates</h1>
        <Button onClick={() => setShowNewTemplate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[600px] overflow-y-auto pr-4">
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedTemplate?.id === template.id && 'border-primary'
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.metadata.category}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.metadata.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          {(selectedTemplate || showNewTemplate) && (
            <DocumentTemplate
              template={selectedTemplate || undefined}
              onSave={handleSaveTemplate}
              onDelete={selectedTemplate ? handleDeleteTemplate : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
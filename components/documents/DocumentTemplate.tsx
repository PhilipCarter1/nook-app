'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { FileText, Plus, Save, Trash2, Tag, X, Home, User, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentTemplate {
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
}

interface DocumentTemplateProps {
  template?: DocumentTemplate;
  onSave: (template: Omit<DocumentTemplate, 'id'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  className?: string;
}

const RENTAL_TEMPLATES = [
  {
    name: 'Standard Lease Agreement',
    type: 'lease',
    content: `LEASE AGREEMENT

This Lease Agreement is made and entered into on [START_DATE] by and between:

LANDLORD:
[LANDLORD_NAME]
[LANDLORD_ADDRESS]

TENANT:
[TENANT_NAME]
[TENANT_ADDRESS]

PROPERTY:
[PROPERTY_ADDRESS]

TERM:
The lease term begins on [START_DATE] and ends on [END_DATE].

RENT:
The monthly rent is [RENT_AMOUNT] dollars, due on the [DUE_DATE] of each month.

SECURITY DEPOSIT:
A security deposit of [DEPOSIT_AMOUNT] dollars is required.

UTILITIES:
[UTILITIES_INCLUDED]

PETS:
[PET_POLICY]

SIGNATURES:

Landlord: _____________________
Date: _____________________

Tenant: _____________________
Date: _____________________`,
    variables: [
      { name: 'START_DATE', type: 'date', required: true },
      { name: 'END_DATE', type: 'date', required: true },
      { name: 'LANDLORD_NAME', type: 'text', required: true },
      { name: 'LANDLORD_ADDRESS', type: 'text', required: true },
      { name: 'TENANT_NAME', type: 'text', required: true },
      { name: 'TENANT_ADDRESS', type: 'text', required: true },
      { name: 'PROPERTY_ADDRESS', type: 'text', required: true },
      { name: 'RENT_AMOUNT', type: 'number', required: true },
      { name: 'DUE_DATE', type: 'number', required: true },
      { name: 'DEPOSIT_AMOUNT', type: 'number', required: true },
      { name: 'UTILITIES_INCLUDED', type: 'select', required: true, options: ['All utilities included', 'Tenant pays all utilities', 'Some utilities included'] },
      { name: 'PET_POLICY', type: 'select', required: true, options: ['No pets allowed', 'Pets allowed with approval', 'Pets allowed with restrictions'] },
    ],
    metadata: {
      category: 'Lease',
      tags: ['lease', 'agreement', 'rental'],
      requiredSignatures: ['landlord', 'tenant'],
      expirationDays: 365,
    },
  },
  {
    name: 'Move-In Inspection Checklist',
    type: 'inspection',
    content: `MOVE-IN INSPECTION CHECKLIST

Property Address: [PROPERTY_ADDRESS]
Inspection Date: [INSPECTION_DATE]
Tenant Name: [TENANT_NAME]

ROOMS:
[ROOMS]

CONDITION NOTES:
[CONDITION_NOTES]

DAMAGES:
[DAMAGES]

UTILITIES:
[UTILITIES_STATUS]

SIGNATURES:

Landlord: _____________________
Date: _____________________

Tenant: _____________________
Date: _____________________`,
    variables: [
      { name: 'PROPERTY_ADDRESS', type: 'text', required: true },
      { name: 'INSPECTION_DATE', type: 'date', required: true },
      { name: 'TENANT_NAME', type: 'text', required: true },
      { name: 'ROOMS', type: 'text', required: true },
      { name: 'CONDITION_NOTES', type: 'text', required: true },
      { name: 'DAMAGES', type: 'text', required: false },
      { name: 'UTILITIES_STATUS', type: 'select', required: true, options: ['All utilities working', 'Some issues noted', 'Major issues present'] },
    ],
    metadata: {
      category: 'Inspection',
      tags: ['inspection', 'move-in', 'checklist'],
      requiredSignatures: ['landlord', 'tenant'],
      expirationDays: 30,
    },
  },
  {
    name: 'Rent Payment Receipt',
    type: 'receipt',
    content: `RENT PAYMENT RECEIPT

Receipt Number: [RECEIPT_NUMBER]
Date: [PAYMENT_DATE]
Property: [PROPERTY_ADDRESS]

Tenant: [TENANT_NAME]
Payment Amount: $[PAYMENT_AMOUNT]
Payment Method: [PAYMENT_METHOD]
Payment Period: [PAYMENT_PERIOD]

Notes: [NOTES]

Received by: [RECEIVED_BY]
Date: [RECEIPT_DATE]`,
    variables: [
      { name: 'RECEIPT_NUMBER', type: 'text', required: true },
      { name: 'PAYMENT_DATE', type: 'date', required: true },
      { name: 'PROPERTY_ADDRESS', type: 'text', required: true },
      { name: 'TENANT_NAME', type: 'text', required: true },
      { name: 'PAYMENT_AMOUNT', type: 'number', required: true },
      { name: 'PAYMENT_METHOD', type: 'select', required: true, options: ['Bank Transfer', 'Credit Card', 'Cash', 'Check'] },
      { name: 'PAYMENT_PERIOD', type: 'text', required: true },
      { name: 'NOTES', type: 'text', required: false },
      { name: 'RECEIVED_BY', type: 'text', required: true },
      { name: 'RECEIPT_DATE', type: 'date', required: true },
    ],
    metadata: {
      category: 'Payment',
      tags: ['receipt', 'payment', 'rent'],
      requiredSignatures: ['landlord'],
      expirationDays: 365,
    },
  },
];

export function DocumentTemplate({
  template,
  onSave,
  onDelete,
  className,
}: DocumentTemplateProps) {
  const [name, setName] = useState(template?.name || '');
  const [type, setType] = useState(template?.type || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.metadata.category || '');
  const [tags, setTags] = useState<string[]>(template?.metadata.tags || []);
  const [newTag, setNewTag] = useState('');
  const [requiredSignatures, setRequiredSignatures] = useState<string[]>(template?.metadata.requiredSignatures || []);
  const [expirationDays, setExpirationDays] = useState(template?.metadata.expirationDays || 30);
  const [variables, setVariables] = useState(template?.variables || []);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSignature = (signature: string) => {
    if (!requiredSignatures.includes(signature)) {
      setRequiredSignatures([...requiredSignatures, signature]);
    }
  };

  const handleRemoveSignature = (signatureToRemove: string) => {
    setRequiredSignatures(requiredSignatures.filter((signature) => signature !== signatureToRemove));
  };

  const handleTemplateSelect = (templateName: string) => {
    const selected = RENTAL_TEMPLATES.find(t => t.name === templateName);
    if (selected) {
      setName(selected.name);
      setType(selected.type);
      setContent(selected.content);
      setCategory(selected.metadata.category);
      setTags(selected.metadata.tags);
      setRequiredSignatures(selected.metadata.requiredSignatures);
      setExpirationDays(selected.metadata.expirationDays);
      setVariables(selected.variables);
    }
  };

  const handleSave = async () => {
    if (!name || !type || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name,
        type,
        content,
        variables,
        metadata: {
          category,
          tags,
          requiredSignatures,
          expirationDays,
        },
      });
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{template ? 'Edit Template' : 'New Template'}</span>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_TEMPLATES.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lease">Lease Agreement</SelectItem>
                <SelectItem value="inspection">Inspection Checklist</SelectItem>
                <SelectItem value="receipt">Payment Receipt</SelectItem>
                <SelectItem value="notice">Notice</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Template Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter template content"
              className="h-48"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
              />
              <Button onClick={handleAddTag} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Signatures</Label>
            <div className="flex flex-wrap gap-2">
              {['landlord', 'tenant', 'witness'].map((signature) => (
                <Badge
                  key={signature}
                  variant={requiredSignatures.includes(signature) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() =>
                    requiredSignatures.includes(signature)
                      ? handleRemoveSignature(signature)
                      : handleAddSignature(signature)
                  }
                >
                  {signature}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expiration Days</Label>
            <Input
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Variables</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={variable.name}
                    onChange={(e) => {
                      const newVariables = [...variables];
                      newVariables[index].name = e.target.value;
                      setVariables(newVariables);
                    }}
                    placeholder="Variable name"
                  />
                  <Select
                    value={variable.type}
                    onValueChange={(value: 'text' | 'date' | 'number' | 'select') => {
                      const newVariables = [...variables];
                      newVariables[index].type = value;
                      setVariables(newVariables);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newVariables = [...variables];
                      newVariables[index].required = !newVariables[index].required;
                      setVariables(newVariables);
                    }}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${
                        variable.required ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setVariables(variables.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setVariables([
                  ...variables,
                  { name: '', type: 'text', required: false },
                ])
              }
            >
              Add Variable
            </Button>
          </div>

          <div className="flex justify-end gap-4">
            {template && onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isSaving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Template
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
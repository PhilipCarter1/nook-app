'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createDocumentRequest, CreateDocumentRequestData } from '@/lib/services/document-requests';

interface Tenant {
  id: string;
  name: string;
  email: string;
  property_id: string;
}

interface DocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  onRequestCreated?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'lease_agreement', label: 'Lease Agreement', description: 'Signed lease agreement' },
  { value: 'id_verification', label: 'ID Verification', description: 'Government-issued photo ID' },
  { value: 'income_proof', label: 'Income Proof', description: 'Pay stubs, tax returns, or bank statements' },
  { value: 'employment_verification', label: 'Employment Verification', description: 'Employment letter or contract' },
  { value: 'bank_statement', label: 'Bank Statement', description: 'Recent bank statements' },
  { value: 'credit_report', label: 'Credit Report', description: 'Credit report or credit score' },
  { value: 'rental_history', label: 'Rental History', description: 'Previous rental references' },
  { value: 'references', label: 'References', description: 'Personal or professional references' },
  { value: 'insurance_certificate', label: 'Insurance Certificate', description: 'Renters insurance certificate' },
  { value: 'pet_documentation', label: 'Pet Documentation', description: 'Pet registration, vaccination records' },
  { value: 'emergency_contact', label: 'Emergency Contact', description: 'Emergency contact information' },
  { value: 'other', label: 'Other', description: 'Other required documentation' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export default function DocumentRequestModal({
  isOpen,
  onClose,
  tenants,
  onRequestCreated
}: DocumentRequestModalProps) {
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill title when document type changes
  useEffect(() => {
    if (documentType) {
      const docType = DOCUMENT_TYPES.find(dt => dt.value === documentType);
      if (docType) {
        setTitle(docType.label);
        setDescription(docType.description);
      }
    }
  }, [documentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTenants.length === 0) {
      toast.error('Please select at least one tenant');
      return;
    }
    
    if (!documentType || !title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create requests for each selected tenant
      const requests = await Promise.all(
        selectedTenants.map(async (tenantId) => {
          const requestData: CreateDocumentRequestData = {
            property_id: tenants.find(t => t.id === tenantId)?.property_id || '',
            tenant_id: tenantId,
            document_type: documentType,
            title,
            description,
            due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
            priority
          };

          return createDocumentRequest(requestData);
        })
      );

      // Check if all requests were successful
      const failedRequests = requests.filter(r => !r.success);
      if (failedRequests.length > 0) {
        toast.error(`Failed to create ${failedRequests.length} request(s)`);
        return;
      }

      toast.success(`Document request sent to ${selectedTenants.length} tenant(s)`);
      onRequestCreated?.();
      handleClose();
    } catch (error) {
      console.error('Error creating document requests:', error);
      toast.error('Failed to create document requests');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTenants([]);
    setDocumentType('');
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('normal');
    onClose();
  };

  const selectedDocumentType = DOCUMENT_TYPES.find(dt => dt.value === documentType);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-nook-purple-600" />
            Request Documents from Tenants
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tenant Selection */}
          <div>
            <Label className="text-base font-medium">Select Tenants</Label>
            <p className="text-sm text-gray-600 mb-3">Choose which tenants to request documents from</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
              {tenants.map((tenant) => (
                <label
                  key={tenant.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTenants.includes(tenant.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenants([...selectedTenants, tenant.id]);
                      } else {
                        setSelectedTenants(selectedTenants.filter(id => id !== tenant.id));
                      }
                    }}
                    className="rounded border-gray-300 text-nook-purple-600 focus:ring-nook-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{tenant.name}</div>
                    <div className="text-xs text-gray-500">{tenant.email}</div>
                  </div>
                </label>
              ))}
            </div>
            {selectedTenants.length > 0 && (
              <p className="text-sm text-nook-purple-600 mt-2">
                {selectedTenants.length} tenant(s) selected
              </p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <Label htmlFor="documentType" className="text-base font-medium">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-medium">Request Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter request title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-medium">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about what you need"
              rows={3}
            />
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-base font-medium">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={option.color}>
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {selectedDocumentType && selectedTenants.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Request Preview</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Document:</strong> {selectedDocumentType.label}</div>
                <div><strong>Tenants:</strong> {selectedTenants.length} selected</div>
                {dueDate && <div><strong>Due Date:</strong> {format(dueDate, 'PPP')}</div>}
                <div><strong>Priority:</strong> 
                  <Badge className={`ml-2 ${PRIORITY_OPTIONS.find(p => p.value === priority)?.color}`}>
                    {PRIORITY_OPTIONS.find(p => p.value === priority)?.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || selectedTenants.length === 0}
              className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700"
            >
              {isSubmitting ? 'Sending...' : `Send Request to ${selectedTenants.length} Tenant(s)`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Workflow, CheckCircle2, XCircle, Clock, User, AlertCircle, FileCheck, UserCheck, ShieldCheck, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  comments?: string;
  validationResults?: {
    isValid: boolean;
    issues: string[];
    stateCompliance: {
      state: string;
      isCompliant: boolean;
      requirements: string[];
    };
  };
}

interface DocumentWorkflowProps {
  steps: WorkflowStep[];
  onApprove: (stepId: string) => Promise<void>;
  onReject: (stepId: string, reason: string) => Promise<void>;
  onValidate: (stepId: string) => Promise<void>;
  className?: string;
}

export function DocumentWorkflow({
  steps,
  onApprove,
  onReject,
  onValidate,
  className,
}: DocumentWorkflowProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.name.toLowerCase()) {
      case 'document upload':
        return <FileCheck className="h-5 w-5" />;
      case 'tenant verification':
        return <UserCheck className="h-5 w-5" />;
      case 'legal review':
        return <ShieldCheck className="h-5 w-5" />;
      case 'landlord approval':
        return <Building2 className="h-5 w-5" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleValidate = async (stepId: string) => {
    try {
      setIsValidating(true);
      await onValidate(stepId);
      toast.success('Document validated successfully');
    } catch (error) {
      toast.error('Failed to validate document');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Workflow & Approvals</span>
          <Workflow className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-start space-x-4 p-4 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{step.name}</h3>
                    <Badge className={getStepColor(step)}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Assigned to: {step.assignedTo}</p>
                    <p>Due: {format(new Date(step.dueDate), 'MMM d, yyyy')}</p>
                    {step.completedAt && (
                      <p>
                        Completed: {format(new Date(step.completedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  {step.comments && (
                    <p className="text-sm text-gray-600">{step.comments}</p>
                  )}
                  {step.validationResults && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            step.validationResults.isValid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {step.validationResults.isValid
                            ? 'Valid'
                            : 'Validation Failed'}
                        </Badge>
                        <Badge
                          className={
                            step.validationResults.stateCompliance.isCompliant
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {step.validationResults.stateCompliance.state} Compliance
                        </Badge>
                      </div>
                      {step.validationResults.issues.length > 0 && (
                        <div className="text-sm text-red-600">
                          <p className="font-medium">Issues:</p>
                          <ul className="list-disc list-inside">
                            {step.validationResults.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.validationResults.stateCompliance.requirements.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">State Requirements:</p>
                          <ul className="list-disc list-inside">
                            {step.validationResults.stateCompliance.requirements.map(
                              (req, index) => (
                                <li key={index}>{req}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {step.status === 'in_progress' && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleValidate(step.id)}
                        disabled={isValidating}
                      >
                        {isValidating ? 'Validating...' : 'Validate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove(step.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (rejectReason) {
                            onReject(step.id, rejectReason);
                          } else {
                            toast.error('Please provide a reason for rejection');
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 
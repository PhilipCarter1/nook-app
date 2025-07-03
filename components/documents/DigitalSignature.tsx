'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Pen, Save, X, CheckCircle2 } from 'lucide-react';
import SignaturePad from 'react-signature-canvas';

interface DigitalSignatureProps {
  onSign: (signatureData: string) => Promise<void>;
  onCancel: () => void;
  documentName: string;
  className?: string;
}

export function DigitalSignature({
  onSign,
  onCancel,
  documentName,
  className,
}: DigitalSignatureProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const signaturePadRef = useRef<SignaturePad>(null);

  const handleClear = () => {
    if (signatureType === 'draw' && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else {
      setTypedSignature('');
    }
  };

  const handleSign = async () => {
    try {
      let signatureData = '';
      
      if (signatureType === 'draw' && signaturePadRef.current) {
        if (signaturePadRef.current.isEmpty()) {
          toast.error('Please provide a signature');
          return;
        }
        signatureData = signaturePadRef.current.toDataURL();
      } else {
        if (!typedSignature.trim()) {
          toast.error('Please provide a signature');
          return;
        }
        signatureData = typedSignature;
      }

      await onSign(signatureData);
      toast.success('Document signed successfully');
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sign Document</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Document</Label>
            <p className="text-sm text-muted-foreground mt-1">{documentName}</p>
          </div>

          <div className="space-y-2">
            <Label>Signature Type</Label>
            <div className="flex gap-4">
              <Button
                variant={signatureType === 'draw' ? 'default' : 'outline'}
                onClick={() => setSignatureType('draw')}
                className="flex-1"
              >
                <Pen className="mr-2 h-4 w-4" />
                Draw
              </Button>
              <Button
                variant={signatureType === 'type' ? 'default' : 'outline'}
                onClick={() => setSignatureType('type')}
                className="flex-1"
              >
                <Pen className="mr-2 h-4 w-4" />
                Type
              </Button>
            </div>
          </div>

          {signatureType === 'draw' ? (
            <div className="space-y-2">
              <Label>Draw Your Signature</Label>
              <div
                className="border rounded-lg"
                onMouseEnter={() => setIsDrawing(true)}
                onMouseLeave={() => setIsDrawing(false)}
              >
                <SignaturePad
                  ref={signaturePadRef}
                  canvasProps={{
                    className: 'w-full h-[200px] rounded-lg',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Type Your Signature</Label>
              <Textarea
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your signature here..."
                className="h-[200px] font-signature"
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSign}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Sign Document
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
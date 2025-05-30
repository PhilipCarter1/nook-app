import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentConfig } from './PaymentConfig';
import { RentSplitManager } from './RentSplitManager';

interface UnitPaymentSettingsProps {
  unitId: string;
  propertyId: string;
  monthlyRent: number;
}

export function UnitPaymentSettings({
  unitId,
  propertyId,
  monthlyRent,
}: UnitPaymentSettingsProps) {
  return (
    <Card className="p-6">
      <Tabs defaultValue="payment-methods" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="rent-splits">Rent Splits</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods">
          <PaymentConfig
            propertyId={propertyId}
            unitId={unitId}
            level="unit"
          />
        </TabsContent>

        <TabsContent value="rent-splits">
          <RentSplitManager
            unitId={unitId}
            monthlyRent={monthlyRent}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
} 
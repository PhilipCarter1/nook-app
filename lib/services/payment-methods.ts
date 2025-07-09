import { supabase } from '@/lib/supabase';

export interface PaymentMethod {
  id: string;
  propertyId: string;
  type: 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'zelle' | 'apple_pay' | 'venmo' | 'paypal' | 'other';
  name: string;
  details: {
    // Bank Transfer
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    // Check
    checkPayableTo?: string;
    mailingAddress?: string;
    // Zelle
    zelleEmail?: string;
    zellePhone?: string;
    // Venmo
    venmoUsername?: string;
    venmoQRCode?: string;
    // PayPal
    paypalEmail?: string;
    paypalLink?: string;
    // Apple Pay
    applePayEmail?: string;
    applePayPhone?: string;
    // General
    instructions?: string;
    processingTime?: string;
    minimumAmount?: number;
    maximumAmount?: number;
    fees?: {
      type: 'percentage' | 'fixed';
      amount: number;
    };
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentMethodParams {
  id: string;
  type: PaymentMethod['type'];
  name: string;
  details: PaymentMethod['details'];
  isDefault?: boolean;
}

export async function createPaymentMethod({
  id,
  type,
  name,
  details,
  isDefault = false,
}: CreatePaymentMethodParams): Promise<PaymentMethod> {
  // If this is set as default, unset any existing default
  if (isDefault) {
    const { error } = await supabase
      .from('payment_methods')
      .update({ isDefault: false })
      .eq('propertyId', id);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      propertyId: id,
      type,
      name,
      details,
      isDefault,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
    .select('*')
    .limit(1);
  if (error || !data || data.length === 0) throw error;
  return data[0] as PaymentMethod;
}

export async function getPaymentMethods(id: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('propertyId', id)
    .order('isDefault', { ascending: false });
  if (error) throw error;
  return data as PaymentMethod[];
}

export async function updatePaymentMethod(
  id: string,
  updates: Partial<CreatePaymentMethodParams>
): Promise<PaymentMethod> {
  // If setting as default, unset any existing default
  if (updates.isDefault) {
    const { data: paymentMethod, error: selectError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .limit(1);
    if (selectError) throw selectError;
    if (paymentMethod && paymentMethod.length > 0) {
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ isDefault: false })
        .eq('propertyId', paymentMethod[0].propertyId);
      if (updateError) throw updateError;
    }
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      ...updates,
      updatedAt: new Date(),
    })
    .eq('id', id)
    .select('*')
    .limit(1);
  if (error || !data || data.length === 0) throw error;
  return data[0] as PaymentMethod;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function setDefaultPaymentMethod(
  id: string,
  paymentMethodId: string
): Promise<void> {
  // Unset all defaults
  const { error: unsetError } = await supabase
    .from('payment_methods')
    .update({ isDefault: false })
    .eq('propertyId', id);
  if (unsetError) throw unsetError;

  // Set new default
  const { error: setError } = await supabase
    .from('payment_methods')
    .update({ isDefault: true })
    .eq('id', paymentMethodId);
  if (setError) throw setError;
}

export async function getDefaultPaymentMethod(
  id: string
): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('propertyId', id)
    .eq('isDefault', true)
    .limit(1);
  if (error) throw error;
  return data && data.length > 0 ? data[0] as PaymentMethod : null;
} 
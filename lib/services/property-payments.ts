import { createClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';

const supabase = createClient();

export interface PropertyPaymentMethod {
  id: string;
  property_id: string;
  type: 'bank_transfer' | 'zelle' | 'venmo' | 'paypal' | 'check' | 'cash' | 'apple_pay' | 'google_pay';
  name: string;
  is_default: boolean;
  is_active: boolean;
  details: {
    // Bank Transfer
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountHolderName?: string;
    
    // Zelle
    zelleEmail?: string;
    zellePhone?: string;
    
    // Venmo
    venmoUsername?: string;
    venmoQRCode?: string;
    
    // PayPal
    paypalEmail?: string;
    paypalLink?: string;
    
    // Check
    checkPayableTo?: string;
    mailingAddress?: string;
    
    // Apple Pay / Google Pay
    applePayEmail?: string;
    applePayPhone?: string;
    googlePayEmail?: string;
    googlePayPhone?: string;
    
    // General
    instructions?: string;
    processingTime?: string;
    minimumAmount?: number;
    maximumAmount?: number;
  };
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyPaymentSettings {
  id: string;
  property_id: string;
  split_rent_enabled: boolean;
  split_type: 'equal' | 'percentage' | 'custom';
  late_fee_percentage: number;
  late_fee_fixed_amount: number;
  grace_period_days: number;
  auto_reminders: boolean;
  reminder_days_before_due: number;
  created_at: string;
  updated_at: string;
}

export interface RentSplit {
  id: string;
  property_id: string;
  tenant_id: string;
  split_amount: number;
  split_percentage?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get payment methods for a property
export async function getPropertyPaymentMethods(propertyId: string): Promise<{
  success: boolean;
  paymentMethods?: PropertyPaymentMethod[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('property_payment_methods')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      log.error('Error fetching payment methods', error as Error);
      return { success: false, error: 'Failed to fetch payment methods' };
    }

    return { success: true, paymentMethods: data || [] };
  } catch (err: unknown) {
    log.error('Error in getPropertyPaymentMethods', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Add payment method to a property
export async function addPropertyPaymentMethod(
  propertyId: string,
  paymentMethod: Omit<PropertyPaymentMethod, 'id' | 'property_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> {
  try {
    // If this is set as default, unset other defaults
    if (paymentMethod.is_default) {
      await supabase
        .from('property_payment_methods')
        .update({ is_default: false })
        .eq('property_id', propertyId);
    }

    const { data, error } = await supabase
      .from('property_payment_methods')
      .insert({
        property_id: propertyId,
        ...paymentMethod
      })
      .select()
      .single();

    if (error) {
      log.error('Error adding payment method', error as Error);
      return { success: false, error: 'Failed to add payment method' };
    }

    return { success: true, paymentMethodId: data.id };
  } catch (err: unknown) {
    log.error('Error in addPropertyPaymentMethod', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Update payment method
export async function updatePropertyPaymentMethod(
  paymentMethodId: string,
  updates: Partial<PropertyPaymentMethod>
): Promise<{ success: boolean; error?: string }> {
  try {
    // If setting as default, unset other defaults for the same property
    if (updates.is_default) {
      const { data: currentMethod } = await supabase
        .from('property_payment_methods')
        .select('property_id')
        .eq('id', paymentMethodId)
        .single();

      if (currentMethod) {
        await supabase
          .from('property_payment_methods')
          .update({ is_default: false })
          .eq('property_id', currentMethod.property_id)
          .neq('id', paymentMethodId);
      }
    }

    const { error } = await supabase
      .from('property_payment_methods')
      .update(updates)
      .eq('id', paymentMethodId);

    if (error) {
      log.error('Error updating payment method', error as Error);
      return { success: false, error: 'Failed to update payment method' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error in updatePropertyPaymentMethod', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Delete payment method
export async function deletePropertyPaymentMethod(
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('property_payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) {
      log.error('Error deleting payment method', error as Error);
      return { success: false, error: 'Failed to delete payment method' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error in deletePropertyPaymentMethod', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get payment settings for a property
export async function getPropertyPaymentSettings(propertyId: string): Promise<{
  success: boolean;
  settings?: PropertyPaymentSettings;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('property_payment_settings')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      log.error('Error fetching payment settings', error as Error);
      return { success: false, error: 'Failed to fetch payment settings' };
    }

    return { success: true, settings: data || null };
  } catch (err: unknown) {
    log.error('Error in getPropertyPaymentSettings', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Update payment settings for a property
export async function updatePropertyPaymentSettings(
  propertyId: string,
  settings: Partial<PropertyPaymentSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('property_payment_settings')
      .upsert({
        property_id: propertyId,
        ...settings
      });

    if (error) {
      log.error('Error updating payment settings', error as Error);
      return { success: false, error: 'Failed to update payment settings' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error in updatePropertyPaymentSettings', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get rent splits for a property
export async function getPropertyRentSplits(propertyId: string): Promise<{
  success: boolean;
  rentSplits?: RentSplit[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('rent_splits')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      log.error('Error fetching rent splits', error as Error);
      return { success: false, error: 'Failed to fetch rent splits' };
    }

    return { success: true, rentSplits: data || [] };
  } catch (err: unknown) {
    log.error('Error in getPropertyRentSplits', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Add rent split for a tenant
export async function addRentSplit(
  propertyId: string,
  tenantId: string,
  splitAmount: number,
  splitPercentage?: number
): Promise<{ success: boolean; rentSplitId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('rent_splits')
      .insert({
        property_id: propertyId,
        tenant_id: tenantId,
        split_amount: splitAmount,
        split_percentage: splitPercentage
      })
      .select()
      .single();

    if (error) {
      log.error('Error adding rent split', error as Error);
      return { success: false, error: 'Failed to add rent split' };
    }

    return { success: true, rentSplitId: data.id };
  } catch (err: unknown) {
    log.error('Error in addRentSplit', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Update rent split
export async function updateRentSplit(
  rentSplitId: string,
  updates: Partial<RentSplit>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('rent_splits')
      .update(updates)
      .eq('id', rentSplitId);

    if (error) {
      log.error('Error updating rent split', error as Error);
      return { success: false, error: 'Failed to update rent split' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error in updateRentSplit', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Delete rent split
export async function deleteRentSplit(
  rentSplitId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('rent_splits')
      .delete()
      .eq('id', rentSplitId);

    if (error) {
      log.error('Error deleting rent split', error as Error);
      return { success: false, error: 'Failed to delete rent split' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error in deleteRentSplit', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get tenant's payment information for a property
export async function getTenantPaymentInfo(propertyId: string, tenantId: string): Promise<{
  success: boolean;
  paymentInfo?: {
    paymentMethods: PropertyPaymentMethod[];
    paymentSettings: PropertyPaymentSettings | null;
    rentSplit: RentSplit | null;
    totalRent: number;
    tenantAmount: number;
  };
  error?: string;
}> {
  try {
    // Get payment methods
    const { paymentMethods } = await getPropertyPaymentMethods(propertyId);
    
    // Get payment settings
    const { settings: paymentSettings } = await getPropertyPaymentSettings(propertyId);
    
    // Get rent split for this tenant
    const { data: rentSplit, error: rentSplitError } = await supabase
      .from('rent_splits')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (rentSplitError && rentSplitError.code !== 'PGRST116') {
      log.error('Error fetching rent split', rentSplitError as Error);
      return { success: false, error: 'Failed to fetch rent split' };
    }

    // Get total rent for the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('monthly_rent')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      log.error('Error fetching property rent', propertyError as Error);
      return { success: false, error: 'Failed to fetch property rent' };
    }

    const totalRent = property.monthly_rent || 0;
    const tenantAmount = rentSplit?.split_amount || totalRent;

    return {
      success: true,
      paymentInfo: {
        paymentMethods: paymentMethods || [],
        paymentSettings: paymentSettings || null,
        rentSplit: rentSplit || null,
        totalRent,
        tenantAmount
      }
    };
  } catch (err: unknown) {
    log.error('Error in getTenantPaymentInfo', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

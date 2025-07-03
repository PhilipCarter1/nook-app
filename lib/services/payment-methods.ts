import { db } from '@/lib/db';
import { paymentMethods } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.propertyId, id));
  }

  const [paymentMethod] = await db
    .insert(paymentMethods)
    .values({
      propertyId: id,
      type,
      name,
      details,
      isDefault,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return paymentMethod;
}

export async function getPaymentMethods(id: string): Promise<PaymentMethod[]> {
  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.propertyId, id))
    .orderBy(paymentMethods.isDefault, 'desc');
}

export async function updatePaymentMethod(
  id: string,
  updates: Partial<CreatePaymentMethodParams>
): Promise<PaymentMethod> {
  // If setting as default, unset any existing default
  if (updates.isDefault) {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));

    if (paymentMethod) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.propertyId, paymentMethod.propertyId));
    }
  }

  const [updated] = await db
    .update(paymentMethods)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(paymentMethods.id, id))
    .returning();

  return updated;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
}

export async function setDefaultPaymentMethod(
  id: string,
  paymentMethodId: string
): Promise<void> {
  // Unset all defaults
  await db
    .update(paymentMethods)
    .set({ isDefault: false })
    .where(eq(paymentMethods.propertyId, id));

  // Set new default
  await db
    .update(paymentMethods)
    .set({ isDefault: true })
    .where(eq(paymentMethods.id, paymentMethodId));
}

export async function getDefaultPaymentMethod(
  id: string
): Promise<PaymentMethod | null> {
  const [paymentMethod] = await db
    .select()
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.propertyId, id),
        eq(paymentMethods.isDefault, true)
      )
    );

  return paymentMethod || null;
} 
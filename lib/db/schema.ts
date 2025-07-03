import { pgTable, text, timestamp, integer, varchar, boolean, json, jsonb, uuid, decimal, numeric, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from '../db';

// Users table (extends Clerk user data)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password').notNull(),
  role: text('role', { enum: ['landlord', 'admin', 'tenant', 'super'] })
    .notNull()
    .default('tenant'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Properties table
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  units: integer('units').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  images: json('images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Units table
export const units = pgTable('units', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  number: varchar('number', { length: 50 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  rent: integer('rent').notNull(),
  deposit: integer('deposit').notNull(),
  features: json('features').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tenants table
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  unitId: uuid('unit_id').notNull().references(() => units.id),
  email: text('email').notNull(),
  leaseStart: timestamp('lease_start').notNull(),
  leaseEnd: timestamp('lease_end').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Maintenance tickets table
export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id).notNull(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull(), // 'low', 'medium', 'high', 'emergency'
  status: text('status').notNull(), // 'open', 'in_progress', 'on_hold', 'resolved', 'closed', 'scheduled'
  category: text('category').notNull(), // 'plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other'
  assignedTo: uuid('assigned_to').references(() => users.id),
  scheduledDate: timestamp('scheduled_date'),
  scheduledTimeSlot: text('scheduled_time_slot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
  isUrgent: boolean('is_urgent').default(false).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
});

// Maintenance ticket comments
export const maintenanceComments = pgTable('maintenance_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => maintenanceTickets.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isInternal: boolean('is_internal').default(false).notNull(),
});

// Maintenance ticket attachments
export const maintenanceAttachments = pgTable('maintenance_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => maintenanceTickets.id).notNull(),
  commentId: uuid('comment_id').references(() => maintenanceComments.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  url: text('url').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Maintenance ticket history
export const maintenanceHistory = pgTable('maintenance_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => maintenanceTickets.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(), // 'created', 'updated', 'assigned', 'status_changed', 'priority_changed', 'commented'
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Maintenance ticket templates
export const maintenanceTemplates = pgTable('maintenance_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Leases table
export const leases = pgTable('leases', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  tenantId: uuid('tenant_id').notNull().references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  monthlyRent: integer('monthly_rent').notNull(),
  securityDeposit: integer('security_deposit').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  leaseId: uuid('lease_id').notNull().references(() => leases.id),
  amount: integer('amount').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // rent, deposit, maintenance
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payment Methods table
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  type: varchar('type', { length: 50 }).notNull(), // bank_transfer, zelle, venmo, paypal, check, cash, other
  name: varchar('name', { length: 255 }).notNull(),
  details: jsonb('details').$type<{
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    checkPayableTo?: string;
    mailingAddress?: string;
    zelleEmail?: string;
    zellePhone?: string;
    venmoUsername?: string;
    venmoQRCode?: string;
    paypalEmail?: string;
    paypalLink?: string;
    applePayEmail?: string;
    applePayPhone?: string;
    instructions?: string;
    processingTime?: string;
    minimumAmount?: number;
    maximumAmount?: number;
    fees?: {
      type: 'percentage' | 'fixed';
      amount: number;
    };
  }>(),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  version: integer('version').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  metadata: json('metadata').$type<{
    size: number;
    mimeType: string;
    pages?: number;
    expirationDate?: string;
    tags?: string[];
    category?: string;
  }>(),
  signatures: json('signatures').$type<{
    userId: string;
    signedAt: string;
    signatureType: 'digital' | 'electronic';
    signatureData: string;
  }[]>(),
  sharedWith: json('shared_with').$type<{
    userId: string;
    permission: 'view' | 'edit' | 'sign';
    sharedAt: string;
  }[]>(),
  analytics: json('analytics').$type<{
    views: number;
    downloads: number;
    shares: number;
    lastViewed: string;
    lastDownloaded: string;
    lastShared: string;
    viewers: {
      userId: string;
      name: string;
      lastViewed: string;
    }[];
  }>(),
  comments: json('comments').$type<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    pageNumber?: number;
    position?: { x: number; y: number };
    createdAt: string;
    updatedAt: string;
  }[]>().default([]),
  workflow: json('workflow').$type<{
    steps: {
      id: string;
      name: string;
      status: 'pending' | 'approved' | 'rejected';
      assignedTo: {
        id: string;
        name: string;
        role: string;
      };
      dueDate: string;
      completedAt?: string;
      comments?: string;
    }[];
    currentStep: number;
    status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'completed';
  }>(),
  auditLogs: json('audit_logs').$type<{
    id: string;
    action: 'view' | 'download' | 'share' | 'comment' | 'sign' | 'approve' | 'reject' | 'renew';
    userId: string;
    userName: string;
    timestamp: string;
    details?: {
      ipAddress?: string;
      userAgent?: string;
      targetUser?: string;
      comments?: string;
      version?: number;
    };
  }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  previousVersions: json('previous_versions').$type<{
    version: number;
    url: string;
    updatedAt: string;
    updatedBy: string;
  }[]>(),
});

// Document templates table
export const documentTemplates = pgTable('document_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  variables: json('variables').$type<string[]>(),
  metadata: json('metadata').$type<{
    category: string;
    tags: string[];
    requiredSignatures: number;
    expirationDays: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document signatures table
export const documentSignatures = pgTable('document_signatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull().references(() => documents.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  signatureType: varchar('signature_type', { length: 20 }).notNull(),
  signatureData: text('signature_data').notNull(),
  signedAt: timestamp('signed_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['maintenance', 'payment', 'lease', 'message', 'document'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  data: jsonb('data'),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(true).notNull(),
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true).notNull(),
});

// Push subscriptions table
export const pushSubscriptions = pgTable('push_subscriptions', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  subscription: jsonb('subscription').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Financial Management Tables
export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  unitId: uuid('unit_id').references(() => units.id),
  tenantId: uuid('tenant_id').references(() => users.id),
  type: text('type').notNull(), // 'income', 'expense', 'transfer'
  category: text('category').notNull(), // 'rent', 'maintenance', 'utilities', 'tax', 'insurance', etc.
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'reversed'
  paymentMethod: text('payment_method'),
  referenceNumber: text('reference_number'),
  attachments: text('attachments').array(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const financialReports = pgTable('financial_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  type: text('type').notNull(), // 'monthly', 'quarterly', 'annual', 'custom'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  data: jsonb('data').notNull(),
  status: text('status').notNull(), // 'draft', 'final', 'archived'
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertyMetrics = pgTable('property_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  date: timestamp('date').notNull(),
  occupancyRate: decimal('occupancy_rate', { precision: 5, scale: 2 }),
  rentalYield: decimal('rental_yield', { precision: 5, scale: 2 }),
  maintenanceCosts: decimal('maintenance_costs', { precision: 10, scale: 2 }),
  operatingExpenses: decimal('operating_expenses', { precision: 10, scale: 2 }),
  netOperatingIncome: decimal('net_operating_income', { precision: 10, scale: 2 }),
  capRate: decimal('cap_rate', { precision: 5, scale: 2 }),
  marketValue: decimal('market_value', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'fixed', 'variable', 'one-time'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const portfolioMetrics = pgTable('portfolio_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  date: timestamp('date').notNull(),
  totalProperties: integer('total_properties').notNull(),
  totalUnits: integer('total_units').notNull(),
  totalValue: numeric('total_value').notNull(),
  averageOccupancyRate: numeric('average_occupancy_rate').notNull(),
  averageRentalYield: numeric('average_rental_yield').notNull(),
  totalRevenue: numeric('total_revenue').notNull(),
  totalExpenses: numeric('total_expenses').notNull(),
  netOperatingIncome: numeric('net_operating_income').notNull(),
  averageCapRate: numeric('average_cap_rate').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantMetrics = pgTable('tenant_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  tenantId: uuid('tenant_id').references(() => users.id).notNull(),
  leaseStartDate: timestamp('lease_start_date').notNull(),
  leaseEndDate: timestamp('lease_end_date').notNull(),
  rentAmount: numeric('rent_amount').notNull(),
  paymentHistory: jsonb('payment_history').$type<{
    date: string;
    amount: number;
    status: 'paid' | 'late' | 'missed';
  }[]>(),
  maintenanceRequests: integer('maintenance_requests').default(0),
  satisfactionScore: integer('satisfaction_score'),
  communicationScore: integer('communication_score'),
  propertyCareScore: integer('property_care_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertyComparisons = pgTable('property_comparisons', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  date: timestamp('date').notNull(),
  marketValue: numeric('market_value').notNull(),
  rentalValue: numeric('rental_value').notNull(),
  occupancyRate: numeric('occupancy_rate').notNull(),
  rentalYield: numeric('rental_yield').notNull(),
  operatingExpenses: numeric('operating_expenses').notNull(),
  netOperatingIncome: numeric('net_operating_income').notNull(),
  capRate: numeric('cap_rate').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  stripe_customer_id: text('stripe_customer_id'),
  subscription_status: text('subscription_status').default('trial'),
  trial_ends_at: timestamp('trial_ends_at'),
  onboarding_completed: boolean('onboarding_completed').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Organization members table
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organization_id: uuid('organization_id').notNull().references(() => organizations.id),
  user_id: text('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 20 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id],
  }),
  tenants: many(tenants),
  maintenanceTickets: many(maintenanceTickets),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  user: one(users, {
    fields: [tenants.userId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [tenants.unitId],
    references: [units.id],
  }),
  maintenanceTickets: many(maintenanceTickets),
  payments: many(payments),
  documents: many(documents),
}));

export const usageAlerts = pgTable('usage_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organization_id: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'properties' | 'units' | 'users'
  current_value: integer('current_value').notNull(),
  limit_value: integer('limit_value').notNull(),
  status: text('status').notNull().default('active'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantInvitations = pgTable('tenant_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  organization_id: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  property_id: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  unit_id: uuid('unit_id')
    .notNull()
    .references(() => units.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  created_at: timestamp('created_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at').notNull(),
  invited_by: uuid('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organization_id: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  stripe_invoice_id: text('stripe_invoice_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull(), // 'paid' | 'unpaid' | 'void'
  due_date: timestamp('due_date').notNull(),
  paid_at: timestamp('paid_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organization_id: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  stripe_subscription_id: text('stripe_subscription_id').notNull(),
  plan_id: text('plan_id').notNull(),
  status: text('status').notNull(), // 'active' | 'canceled' | 'past_due'
  current_period_start: timestamp('current_period_start').notNull(),
  current_period_end: timestamp('current_period_end').notNull(),
  cancel_at_period_end: boolean('cancel_at_period_end').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Remove the pgFunction and replace with a TypeScript function
export async function acceptTenantInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  // Fetch invitation
  const { data: invitation, error: fetchError } = await db
    .from('tenant_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invitation || invitation.status !== 'pending') {
    throw new Error('Invalid or expired invitation');
  }

  // Update invitation status
  const { error: updateError } = await db
    .from('tenant_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (updateError) {
    throw new Error('Failed to update invitation status');
  }

  // Create tenant record
  const { error: insertError } = await db
    .from('tenants')
    .insert({
      user_id: userId,
      unit_id: invitation.unit_id,
      email: invitation.email,
      lease_start: new Date().toISOString(),
      lease_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    throw new Error('Failed to create tenant record');
  }
}

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  properties: many(properties),
  usageAlerts: many(usageAlerts),
  tenantInvitations: many(tenantInvitations),
  invoices: many(invoices),
  subscriptions: many(subscriptions),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organization_id],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.user_id],
    references: [users.id],
  }),
}));

export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  move_in_date: text('move_in_date').notNull(),
  property_id: uuid('property_id')
    .notNull()
    .references(() => properties.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationDocuments = pgTable('application_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  application_id: uuid('application_id')
    .notNull()
    .references(() => applications.id),
  type: text('type').notNull(),
  url: text('url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationReviews = pgTable('application_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  application_id: uuid('application_id')
    .notNull()
    .references(() => applications.id),
  reviewer_id: uuid('reviewer_id')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: ['approved', 'rejected'] }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  property: one(properties, {
    fields: [applications.property_id],
    references: [properties.id],
  }),
  documents: many(applicationDocuments),
  reviews: many(applicationReviews),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one }) => ({
  application: one(applications, {
    fields: [applicationDocuments.application_id],
    references: [applications.id],
  }),
}));

export const applicationReviewsRelations = relations(applicationReviews, ({ one }) => ({
  application: one(applications, {
    fields: [applicationReviews.application_id],
    references: [applications.id],
  }),
  reviewer: one(users, {
    fields: [applicationReviews.reviewer_id],
    references: [users.id],
  }),
}));

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  recipientId: uuid('recipient_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  type: text('type').notNull().default('text'),
  metadata: jsonb('metadata'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
  }),
})); 
# Nook App Database Structure Audit

**Generated:** February 4, 2026  
**Status:** Production Readiness Assessment

---

## 1. DATABASE SCHEMA OVERVIEW

### Primary Schema File
- **Location:** [lib/db/schema.ts](lib/db/schema.ts)
- **Type:** Drizzle ORM TypeScript definitions
- **Database Driver:** PostgreSQL (via Supabase)
- **Database URL:** Configured in `.env.local` as `DRIZZLE_DB_URL`

### Drizzle Configuration
- **Config File:** [drizzle.config.ts](drizzle.config.ts)
- **Output Directory:** `./drizzle/` (for migrations - currently empty/not generated)
- **Available Commands:**
  - `npm run db:generate` - Generate migrations
  - `npm run db:push` - Push schema to database
  - `npm run db:studio` - Open Drizzle Studio

---

## 2. TABLES IN THE DATABASE

### Core User Management Tables

#### **users** Table
**Columns:**
- `id` (UUID) - Primary Key
- `email` (text) - Unique email address
- `name` (text) - User name
- `password` (text) - Hashed password
- **`role` (text enum)** - User role - **CRITICAL**
  - Allowed values: `'landlord'`, `'admin'`, `'tenant'`, `'super'`
  - Default: `'tenant'`
- `created_at` (timestamp) - Auto-generated
- `updated_at` (timestamp) - Auto-generated

**Status:** ✅ Properly configured with role enum

---

### Property Management Tables

#### **properties** Table
**Columns:**
- `id` (UUID) - Primary Key
- `userId` (text) - References users.id
- `name` (varchar) - Property name
- `address` (text) - Property address
- `units` (integer) - Number of units
- `status` (varchar) - Property status
- `images` (json) - Array of image URLs
- `createdAt`, `updatedAt` (timestamps)

#### **units** Table
**Columns:**
- `id` (UUID) - Primary Key
- `propertyId` (UUID) - References properties.id
- `number` (varchar) - Unit number
- `type` (varchar) - Unit type
- `status` (varchar) - Unit status
- `rent` (integer) - Monthly rent
- `deposit` (integer) - Security deposit
- `features` (json) - Array of features
- `createdAt`, `updatedAt` (timestamps)

#### **tenants** Table
**Columns:**
- `id` (UUID) - Primary Key
- `userId` (text) - References users.id
- `unitId` (UUID) - References units.id
- `email` (text) - Tenant email
- `leaseStart` (timestamp) - Lease start date
- `leaseEnd` (timestamp) - Lease end date
- `status` (varchar) - Tenant status
- `createdAt`, `updatedAt` (timestamps)

**Note:** Connects tenants (users) to specific units

---

### Lease & Payment Tables

#### **leases** Table
**Columns:**
- `id` (UUID) - Primary Key
- `propertyId` (UUID) - References properties.id
- `tenantId` (UUID) - References users.id
- `startDate` (timestamp) - Lease start
- `endDate` (timestamp) - Lease end
- `status` (varchar) - Lease status (default: `'pending'`)
- `monthlyRent` (integer) - Monthly rent amount
- `securityDeposit` (integer) - Deposit amount
- `stripeCustomerId` (varchar) - Stripe integration
- `createdAt`, `updatedAt` (timestamps)

#### **payments** Table
**Columns:**
- `id` (UUID) - Primary Key
- `leaseId` (UUID) - References leases.id
- `amount` (integer) - Payment amount
- `type` (varchar) - Payment type (`'rent'`, `'deposit'`, `'maintenance'`)
- `status` (varchar) - Payment status (default: `'pending'`)
- `stripePaymentId` (varchar) - Stripe transaction ID
- `stripeCustomerId` (varchar) - Stripe customer ID
- `dueDate` (timestamp) - Payment due date
- `paidAt` (timestamp) - When payment was made
- `createdAt`, `updatedAt` (timestamps)

#### **paymentMethods** Table
**Columns:**
- `id` (UUID) - Primary Key
- `propertyId` (UUID) - References properties.id
- `type` (varchar) - Payment method type
  - Options: `'bank_transfer'`, `'zelle'`, `'venmo'`, `'paypal'`, `'check'`, `'cash'`, `'other'`
- `name` (varchar) - Method name
- `details` (jsonb) - Complex payment details (account numbers, routing, Zelle/Venmo usernames, PayPal email, etc.)
- `isDefault` (boolean) - Default method flag
- `isActive` (boolean) - Active/inactive flag
- `createdAt`, `updatedAt` (timestamps)

---

### Maintenance & Support Tables

#### **maintenanceTickets** Table
**Columns:**
- `id` (UUID) - Primary Key
- `propertyId` (UUID) - References properties.id
- `unitId` (UUID) - References units.id
- `tenantId` (UUID) - References users.id (requester)
- `title` (text) - Ticket title
- `description` (text) - Detailed description
- `priority` (text) - `'low'`, `'medium'`, `'high'`, `'emergency'`
- `status` (text) - Ticket status (open, in_progress, on_hold, resolved, closed, scheduled)
- `category` (text) - Category (plumbing, electrical, hvac, structural, appliance, other)
- `assignedTo` (UUID) - References users.id (assigned staff)
- `scheduledDate` (timestamp) - Scheduled service date
- `scheduledTimeSlot` (text) - Time window
- `createdAt`, `updatedAt`, `resolvedAt` (timestamps)
- `estimatedCost`, `actualCost` (decimal) - Cost tracking
- `isUrgent`, `isPremium` (boolean) - Flags
- **Notes:** Full maintenance ticket system with priority, scheduling, and cost tracking

#### **maintenanceComments** Table
- Supports comments on tickets
- `isInternal` flag for internal notes

#### **maintenanceAttachments** Table
- File uploads for maintenance tickets
- Tracks file metadata (name, type, size, URL)

#### **maintenanceHistory** Table
- Audit trail for ticket changes
- Tracks who made what changes and when

#### **maintenanceTemplates** Table
- Reusable maintenance templates per property

---

### Document Management Tables

#### **documents** Table
**Columns:**
- `id` (UUID) - Primary Key
- `tenantId` (UUID) - References tenants.id
- `type` (varchar) - Document type
- `name` (varchar) - Document name
- `url` (text) - Document URL
- `version` (integer) - Version number
- `status` (varchar) - Document status (default: `'pending'`)
- `metadata` (json) - File metadata (size, MIME type, pages, expiration, tags, category)
- `signatures` (json) - Array of digital signatures
- `sharedWith` (json) - Who document is shared with and permissions
- `analytics` (json) - View/download/share tracking
- `comments` (json) - Document comments (paginated, with position tracking)
- `workflow` (json) - Approval workflow steps and status
- `auditLogs` (json) - Complete audit trail of actions
- `previousVersions` (json) - Version history
- `expiresAt` (timestamp) - Document expiration
- `createdAt`, `updatedAt` (timestamps)

**Advanced Features:**
- Document approval workflows
- Digital signatures
- Share permissions (view/edit/sign)
- Analytics and audit logs
- Version management
- Expiration dates

#### **documentTemplates** Table
- Reusable document templates
- Variable support for dynamic content
- Metadata and category system

#### **documentSignatures** Table
- Separate table for signature tracking
- Captures signature type, data, IP address, user agent
- Audit trail for each signature

---

### Financial Management Tables

#### **financialTransactions** Table
**Columns:**
- `id` (UUID) - Primary Key
- `propertyId` (UUID) - References properties.id
- `unitId` (UUID) - References units.id (optional)
- `tenantId` (UUID) - References users.id (optional)
- `type` (text) - `'income'`, `'expense'`, `'transfer'`
- `category` (text) - `'rent'`, `'maintenance'`, `'utilities'`, `'tax'`, `'insurance'`, etc.
- `amount` (decimal) - Transaction amount
- `description` (text) - Description
- `date` (timestamp) - Transaction date
- `status` (text) - `'pending'`, `'completed'`, `'failed'`, `'reversed'`
- `paymentMethod` (text) - Payment method used
- `referenceNumber` (text) - Reference/tracking number
- `attachments` (text array) - File URLs
- `metadata` (jsonb) - Additional data
- `createdAt`, `updatedAt` (timestamps)

#### **financialReports** Table
- Monthly, quarterly, annual, or custom reports
- Stores complete report data as JSON

#### **propertyMetrics** Table
- Tracks metrics like occupancy rate, rental yield, maintenance costs
- Operating expenses, NOI, cap rate, market value

#### **expenseCategories** Table
- Fixed, variable, or one-time expense categories

---

### Tenant & Relationship Tables

#### **tenantInvitations** Table
**Columns:**
- `id` (UUID) - Primary Key
- `organization_id` (UUID) - References organizations.id
- `property_id` (UUID) - References properties.id
- `unit_id` (UUID) - References units.id
- `email` (text) - Invited email
- `status` (text) - `'pending'`, `'accepted'`, `'expired'`
- `createdAt` (timestamp)
- `expiresAt` (timestamp) - Invitation expiration
- `invitedBy` (UUID) - References users.id

**Purpose:** Send invitations to tenants to join units

---

### Organizational & Admin Tables

#### **organizations** Table
**Columns:**
- `id` (UUID) - Primary Key
- `name` (varchar) - Organization name
- `stripe_customer_id` (text) - Stripe integration
- `subscription_status` (text) - `'trial'`, `'active'`, `'paused'`, `'canceled'`
- `trial_ends_at` (timestamp)
- `onboarding_completed` (boolean)
- `createdAt`, `updatedAt` (timestamps)

#### **organizationMembers** Table
- Links users to organizations
- Role per organization member

#### **usageAlerts** Table
- Tracks usage limits (properties, units, users)
- Alerts when approaching limits

#### **subscriptions** Table
- Stripe subscription management
- Plan tracking and period dates

#### **invoices** Table
- Invoice records from Stripe
- Tracks billing history

---

### Application & Notification Tables

#### **applications** Table
**Columns:**
- `id` (UUID) - Primary Key
- `first_name`, `last_name` (text)
- `email`, `phone` (text)
- `move_in_date` (text)
- `property_id` (UUID) - References properties.id
- `status` (text) - `'pending'`, `'approved'`, `'rejected'`
- `createdAt`, `updatedAt` (timestamps)

#### **applicationDocuments** Table
- Documents submitted with applications
- Type and URL tracking

#### **applicationReviews** Table
- Review records with reviewer notes
- Approval/rejection status

#### **notifications** Table
**Columns:**
- `id` (UUID) - Primary Key
- `userId` (text) - References users.id
- `type` (text) - `'maintenance'`, `'payment'`, `'lease'`, `'message'`, `'document'`
- `title`, `message` (text)
- `link` (text) - Action link
- `data` (jsonb) - Additional data
- `read` (boolean) - Read status
- `createdAt`, `updatedAt` (timestamps)

#### **messages** Table
- Direct messaging between users
- Sender and recipient references

---

### User Settings & Metrics Tables

#### **userSettings** Table
- `pushNotificationsEnabled` (boolean)
- `emailNotificationsEnabled` (boolean)

#### **pushSubscriptions** Table
- Web push notification subscriptions

#### **portfolioMetrics** Table
- Aggregated metrics for landlords
- Total properties, units, value, occupancy, yield, etc.

#### **tenantMetrics** Table
- Per-tenant metrics
- Payment history, maintenance requests, satisfaction scores

#### **propertyComparisons** Table
- Market comparison data for properties

---

## 3. ROLE FIELD DETAILED ANALYSIS

### Location
- **Table:** `users`
- **Column:** `role`
- **Data Type:** `text` with enum constraint
- **Allowed Values:** `'landlord'`, `'admin'`, `'tenant'`, `'super'`
- **Default:** `'tenant'`
- **Constraints:** NOT NULL

### Role Definitions (from schema)
- **`tenant`** - Residential tenant/occupant
- **`landlord`** - Property owner/manager
- **`admin`** - System administrator
- **`super`** - Superuser (likely unrestricted access)

### Current Implementation Status
✅ Role field properly configured as enum  
✅ Default value set to 'tenant' (safe default)  
⚠️ **TODO:** Verify RLS policies are restricting based on role  
⚠️ **TODO:** Ensure superuser privileges are properly gated  
⚠️ **TODO:** Check API endpoints validate role before sensitive operations

---

## 4. ROW LEVEL SECURITY (RLS) STATUS

### RLS Implementation Status

**Tables that SHOULD have RLS enabled** (based on schema and audit files):
- ✅ `users` - For user privacy
- ✅ `properties` - Owner access control
- ✅ `units` - Property-level access
- ✅ `tenants` - Tenant data privacy
- ✅ `leases` - Sensitive lease documents
- ✅ `payments` - Financial data (CRITICAL)
- ✅ `paymentMethods` - Payment information
- ✅ `maintenance_tickets` - Access control by property/unit
- ✅ `documents` - Document access control
- ✅ `financial_transactions` - Financial privacy
- ✅ `notifications` - User-specific data

### RLS Policies Found in Codebase
Several audit files reference RLS policies but the actual policy implementations are in:
- `secure-document-policies.sql` - Document approval workflow policies
- `create-payment-system-tables.sql` - Payment-related RLS policies
- `fix-rls-policies.sql` - RLS policy fixes

### **⚠️ CRITICAL ISSUE:** 
**Migrations directory (`supabase/migrations/`) is mentioned in scripts but doesn't exist yet.** This suggests RLS policies may not be deployed to the actual database.

---

## 5. DATABASE SETUP & MIGRATION STATUS

### Seed Data
- **Location:** [supabase/seed.sql](supabase/seed.sql)
- **Purpose:** Populates test data for development/testing
- **Test Users Created:**
  - Admin user (admin@example.com)
  - Test landlord (landlord@example.com or test@example.com)
  - Test tenants (tenant@example.com)
- **Test Data Includes:**
  - Sample properties
  - Sample units
  - Sample leases
  - Sample payments
  - Maintenance tickets
  - Documents
  - Organizations

### Migration Strategy
**Current Status:** ⚠️ **INCOMPLETE**

The codebase references migrations but they need to be generated:

```bash
# Generate migrations from schema
npm run db:generate

# Push schema to database (applies migrations)
npm run db:push
```

### Files Indicating Migration Requirements
- [guide/02_setup_instructions.md](guide/02_setup_instructions.md) mentions:
  - Running Drizzle migrations
  - Supabase migrations in `supabase/migrations/*.sql`
  - Manual migration execution if needed

### Migration Files Mentioned (but not present)
```
supabase/migrations/20240321000000_tenant_post_lease.sql
supabase/migrations/20240321000001_admin_features.sql
supabase/migrations/20240321000002_payment_config.sql
supabase/migrations/20240321000003_module_config.sql
```

**⚠️ These migration files are referenced in scripts but DO NOT EXIST in the repository.**

---

## 6. FOREIGN KEY RELATIONSHIPS

### Reference Graph
```
users (id) ← referenced by:
  ├── properties.userId
  ├── tenants.userId
  ├── leases.tenantId
  ├── maintenanceTickets.tenantId
  ├── maintenanceTickets.assignedTo
  ├── payments.tenantId
  ├── financialTransactions.tenantId
  ├── organizationMembers.user_id
  ├── documents.created_by
  ├── notif.user_id
  └── ... (many others)

properties (id) ← referenced by:
  ├── units.propertyId
  ├── leases.propertyId
  ├── maintenanceTickets.propertyId
  ├── payments.propertyId
  ├── paymentMethods.propertyId
  ├── financialTransactions.propertyId
  ├── propertyMetrics.propertyId
  └── ... (others)

units (id) ← referenced by:
  ├── tenants.unitId
  ├── maintenanceTickets.unitId
  └── ... (others)

leases (id) ← referenced by:
  ├── payments.leaseId
  └── ... (others)
```

**Status:** ✅ Proper referential integrity setup with cascade delete on critical tables

---

## 7. PRODUCTION READINESS CHECKLIST

### ✅ Completed/Configured
- [x] Drizzle ORM schema definition
- [x] Enum types for `role` field
- [x] Foreign key relationships
- [x] Default values set appropriately
- [x] Timestamp fields (created_at, updated_at)
- [x] Comprehensive table structure
- [x] Stripe integration placeholders
- [x] Seed data for testing
- [x] TypeScript type definitions
- [x] Notification system tables
- [x] Document management with versioning
- [x] Financial reporting tables
- [x] Maintenance tracking system

### ⚠️ Requires Action
- [ ] **RLS Policies Deployment** - Policies defined but may not be in database
- [ ] **Migrations Generation** - Run `npm run db:generate` to create migration files
- [ ] **Migrations Deployment** - Run `npm run db:push` to apply schema to database
- [ ] **Missing Migration Files** - Create the referenced migration files or verify they're in Supabase dashboard
- [ ] **RLS Policy Verification** - Verify all critical tables have RLS enabled:
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = true;
  ```
- [ ] **Enum Validation** - Test that role field only accepts allowed values
- [ ] **Foreign Key Constraints** - Verify cascade delete behavior
- [ ] **Indexes Creation** - Add indexes on frequently queried columns (e.g., userId, propertyId)
- [ ] **Performance Testing** - Test query performance with production-like data volume

### ❌ Not Yet Confirmed
- [ ] Actual database tables exist in Supabase
- [ ] RLS policies are active on tables
- [ ] Stripe payment integration is configured
- [ ] All foreign key constraints are active
- [ ] Cascade delete behavior is correct
- [ ] Unique constraints are in place (e.g., email in users)

---

## 8. CRITICAL SECURITY REQUIREMENTS

### 1. **Role-Based Access Control (RBAC)**
Current state: Role field exists but needs validation:
- [ ] API endpoints must validate user role before operations
- [ ] Landlords should NOT see other landlords' properties
- [ ] Tenants should only see their assigned units
- [ ] Admins should have auditable access to all data
- [ ] Superusers should be rare and logged

### 2. **Row Level Security (RLS) Policies**
**CRITICAL STATUS: ⚠️ NEEDS VERIFICATION IN DATABASE**

Required policies:
```sql
-- Example pattern for users table
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

-- Example pattern for properties
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (
    userId = auth.uid() OR
    EXISTS (
      SELECT 1 FROM leases 
      WHERE leases.property_id = properties.id 
      AND leases.tenant_id = auth.uid()
    ) OR
    auth.jwt() ->> 'role' = 'admin'
  );
```

### 3. **Payment Data Protection**
- [ ] Stripe integration limits PCI data exposure
- [ ] Payment method details should be encrypted
- [ ] Payment history should have RLS
- [ ] Audit logs for all payment modifications

### 4. **Document Access Control**
- [ ] Documents should only be accessible by tenant or property owner
- [ ] Digital signatures need audit trail
- [ ] Document sharing must be explicit
- [ ] Version history should be immutable

---

## 9. RECOMMENDATIONS FOR PRODUCTION

### Immediate Actions (Before Deployment)
1. **Generate and Apply Migrations**
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Verify RLS is Enabled**
   Run the production verification script:
   ```bash
   psql $DATABASE_URL -f PRODUCTION_VERIFICATION.sql
   ```

3. **Test Role-Based Access**
   - Create test accounts with each role
   - Verify that tenant1 cannot see tenant2's data
   - Verify that landlord1 cannot see landlord2's properties
   - Verify that admins can view all data (with audit logging)

4. **Create Indexes**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_properties_user_id ON properties(user_id);
   CREATE INDEX idx_tenants_user_id ON tenants(user_id);
   CREATE INDEX idx_payments_lease_id ON payments(lease_id);
   CREATE INDEX idx_payments_status ON payments(status);
   CREATE INDEX idx_leases_property_id ON leases(property_id);
   CREATE INDEX idx_leases_status ON leases(status);
   ```

5. **Enable Database Encryption**
   - Ensure SSL/TLS is enforced
   - Enable column-level encryption for sensitive fields (passwords already hashed, but payment details should be encrypted)

### Before Customer Data
1. Encrypt all passwords with strong hashing (bcrypt with salt ≥ 12 rounds)
2. Audit all API endpoints for authorization checks
3. Implement comprehensive logging for financial transactions
4. Test backup and recovery procedures
5. Verify GDPR compliance (right to be forgotten, data export)

### Ongoing Maintenance
1. Regular RLS policy audits
2. Monthly database backups (Supabase handles this)
3. Query performance monitoring
4. User access audit logs review
5. Maintain migration version history

---

## 10. SUMMARY TABLE

| Component | Status | Notes |
|-----------|--------|-------|
| **Schema Definition** | ✅ Complete | Drizzle ORM TypeScript schema |
| **Users Table** | ✅ Complete | Has role enum (tenant, landlord, admin, super) |
| **Role Field** | ✅ Configured | Properly typed with default 'tenant' |
| **Properties Tables** | ✅ Complete | Full relationship structure |
| **Payment Tables** | ✅ Complete | Multiple payment methods supported |
| **Lease Management** | ✅ Complete | Start/end dates, status tracking |
| **Maintenance System** | ✅ Complete | Full ticket lifecycle with templates |
| **Document Management** | ✅ Complete | Versioning, signatures, workflows |
| **Financial Reporting** | ✅ Complete | Transactions, reports, metrics |
| **RLS Policies** | ⚠️ Partial | Defined in SQL files but needs verification in DB |
| **Migrations** | ⚠️ Incomplete | Need to generate with `npm run db:generate` |
| **Seed Data** | ✅ Available | Test data in supabase/seed.sql |
| **Type Definitions** | ✅ Complete | TypeScript types for all major tables |
| **Production Ready** | ❌ Not Yet | Awaiting migration deployment & RLS verification |

---

## 11. NEXT STEPS

### For Development Team
1. Run `npm run db:generate` to create Drizzle migrations
2. Verify migrations are correct in generated `drizzle/` directory
3. Run `npm run db:push` to apply schema to development database
4. Run `supabase/seed.sql` to populate test data
5. Verify RLS policies are active using verification scripts

### For DevOps/Database Admin
1. Coordinate with team on migration timing
2. Run PRODUCTION_VERIFICATION.sql in staging environment
3. Create database backups before applying migrations
4. Monitor database performance after schema changes
5. Verify all RLS policies are correctly applied

### For QA
1. Test each user role (tenant, landlord, admin, super)
2. Verify data isolation (tenant1 cannot see tenant2 data)
3. Test payment workflows end-to-end
4. Verify document sharing and signatures work
5. Confirm role transitions work correctly

---

**Last Updated:** February 4, 2026  
**Audit By:** GitHub Copilot  
**Status:** Ready for Implementation Team Review

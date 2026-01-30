# Action Items - Aligned with MVP Requirements

**Last Updated**: January 27, 2026  
**Coordinated with**: REQUIREMENTS_TRACKER.md, ACTION_PLAN.md

---

## 🎯 PHASE 1: STABILIZE CORE (Week 1) - CRITICAL

### A. Role-Based Access Control (HIGH PRIORITY)
- [ ] Verify all 5 role redirects in `app/auth/callback/route.ts`
- [ ] Test: Tenant → `/dashboard/tenant`
- [ ] Test: Landlord → `/dashboard/landlord`
- [ ] Test: Manager → `/dashboard/manager`
- [ ] Test: Super → `/super/dashboard`
- [ ] Test: Admin → `/admin/dashboard`
- [ ] Add middleware protection to all protected routes
- [ ] Add authorization checks to all API endpoints

### B. RLS Policies - Re-enable Gradually (HIGH PRIORITY)
- [ ] Create comprehensive RLS test suite
- [ ] Re-enable RLS on `users` table
- [ ] Test tenant data isolation
- [ ] Move to `organizations` table
- [ ] Test landlord org data isolation
- [ ] Document policy creation process
- [ ] Create RLS policy runbook

### C. Build & Navigation Verification
- [ ] Run `npm run build` - confirm success
- [ ] Run `npm run lint` - zero errors
- [ ] Verify all main navigation paths work
- [ ] Check for broken links/dead buttons
- [ ] Fix any remaining TS errors

**Completion Target**: End of Week 1

---

## 🎯 PHASE 2: ONBOARDING & PROPERTIES (Weeks 2-3) - CRITICAL

### A. Landlord Onboarding Wizard
- [ ] Create 5-step wizard component
- [ ] Step 1: Create property (name, address, type, units)
- [ ] Step 2: Create units (unit #, beds, baths, rent)
- [ ] Step 3: Configure payment methods
- [ ] Step 4: Invite staff (optional MVP)
- [ ] Step 5: Invite tenants
- [ ] Add progress indicator
- [ ] Allow editing of previous steps
- [ ] Save after each step to database

### B. Property/Unit Management
- [ ] Update `properties` list page (CRUD)
- [ ] Update `units` management (create/edit/delete)
- [ ] Add property detail page with unit overview
- [ ] Implement proper error handling and UX
- [ ] Add success notifications

### C. Trial System Implementation
- [ ] Add `trial_start_date`, `trial_status` to `organizations`
- [ ] Create `trial-service.ts`
- [ ] Auto-create trial on landlord signup (30 days)
- [ ] Add trial status widget to dashboard
- [ ] Implement trial expiration emails (7/3/0 days)
- [ ] Create upgrade flow

### D. Tenant Invitation System (Email)
- [ ] Integrate SendGrid (if not already done)
- [ ] Create invite email template
- [ ] Implement email sending on invite
- [ ] Add resend invite functionality
- [ ] Implement bulk import (CSV)
- [ ] Track invite acceptance
- [ ] Create lease on acceptance

**Completion Target**: End of Week 3

---

## 🎯 PHASE 3: TENANT DASHBOARD & DOCUMENTS (Weeks 4-5) - CRITICAL

### A. Tenant Dashboard
- [ ] Create tenant dashboard page (`/dashboard/tenant`)
- [ ] Show assigned units/leases
- [ ] Create unit detail page (`/dashboard/tenant/units/[id]`)
- [ ] Add tabs: Overview, Payments, Maintenance, Documents
- [ ] Display lease information and contacts
- [ ] Show payment status and due dates

### B. Document Upload & Management
- [ ] Create document upload component
- [ ] Add category selection (ID, Income, Bank, References)
- [ ] Implement Supabase Storage integration
- [ ] Create document list/gallery
- [ ] Add file preview (images, PDF)
- [ ] Track document versions (latest = current)
- [ ] Add status tracking (missing/uploaded/updated)
- [ ] Implement landlord verification checkbox

### C. Database Schema Updates (Documents)
- [ ] Add `document_category` field
- [ ] Add `is_current` flag for versioning
- [ ] Add `verified_by` and `verified_at` fields
- [ ] Update RLS policies for document access

**Completion Target**: End of Week 5

---

## 🎯 PHASE 4: PAYMENTS (Weeks 6-7) - CRITICAL

### A. Stripe Payment Processing
- [ ] Complete Stripe Elements form component
- [ ] Handle card, Apple Pay, Google Pay
- [ ] Implement payment intent flow (existing route)
- [ ] Add payment confirmation emails
- [ ] Store payment records in database
- [ ] Add payment receipt generation
- [ ] Implement error handling for failed payments
- [ ] Add refund capability for landlord

### B. Manual Payment Methods
- [ ] Implement Bank Transfer method
- [ ] Implement Zelle method
- [ ] Implement Venmo method
- [ ] Implement Cash App method
- [ ] Create manual payment submission form
- [ ] Add proof upload for verification
- [ ] Create landlord verification UI
- [ ] Track status: pending → verified/rejected

### C. Split Rent System
- [ ] Ensure `rent_splits` table exists or create it
- [ ] Display split amounts to all roommates
- [ ] Create split-specific payment form
- [ ] Track partial payments
- [ ] Show status: unpaid, pending, partially paid, paid
- [ ] Display contribution breakdown

### D. Landlord Payment Dashboard
- [ ] Create payment dashboard page
- [ ] Add filters: property, unit, tenant, date range
- [ ] Show status breakdown chart
- [ ] List all payments with details
- [ ] Add CSV export
- [ ] Integrate manual payment verification UI
- [ ] Add real-time updates

**Completion Target**: End of Week 7

---

## 🎯 PHASE 5: MAINTENANCE & ANALYTICS (Week 8+) - IMPORTANT

### A. Maintenance Ticket System
- [ ] Create ticket creation form
- [ ] Add category selection
- [ ] Add priority selection
- [ ] Implement photo upload
- [ ] Create ticket detail/comment thread page
- [ ] Add real-time comment updates (Supabase Realtime)
- [ ] Implement ticket assignment workflow
- [ ] Add internal notes (landlord-only)
- [ ] Create super dashboard (assigned tickets)
- [ ] Create landlord dashboard (all tickets, filter by status/unit)

### B. Analytics & Dashboards
- [ ] Create unit analytics dashboard
- [ ] Create property analytics dashboard
- [ ] Create org analytics dashboard
- [ ] Implement revenue metrics
- [ ] Implement ticket metrics
- [ ] Add date range filtering
- [ ] Implement trend analysis
- [ ] Add export to CSV/PDF

**Completion Target**: End of Week 8+

---

## 🔧 TECHNICAL DEBT & CLEANUP (Ongoing)

### Code Quality
- [ ] Remove/standardize console.log statements
- [ ] Replace 'any' types with proper interfaces
- [ ] Improve error messages and handling
- [ ] Add proper logging infrastructure
- [ ] Refactor large components
- [ ] Implement consistent state management

### Testing
- [ ] Add unit test coverage (target 80%)
- [ ] Expand E2E test suite
- [ ] Add integration tests
- [ ] Create smoke tests for critical flows

### Performance
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Optimize database queries
- [ ] Implement caching where appropriate

---

## 📝 DOCUMENTATION UPDATES

- [ ] Update README.md with feature status
- [ ] Create setup guide for new developers
- [ ] Document API endpoints
- [ ] Create database schema documentation
- [ ] Document RLS policies
- [ ] Create deployment runbook

---

## 🎓 FILES REQUIRING ATTENTION (Priority Order)

**Phase 1 (Week 1)**:
- [ ] `app/auth/callback/route.ts` - Role redirects
- [ ] `middleware.ts` - Route protection
- [ ] `components/providers/auth-provider.tsx` - Error handling
- [ ] RLS migration files in `supabase/migrations/`

**Phase 2 (Weeks 2-3)**:
- [ ] `app/dashboard/landlord/onboarding/**` - Wizard (new)
- [ ] `app/dashboard/landlord/properties/page.tsx` - CRUD
- [ ] `app/dashboard/landlord/units/page.tsx` - Management
- [ ] Email service integration

**Phase 3 (Weeks 4-5)**:
- [ ] `app/dashboard/tenant/page.tsx` - Dashboard
- [ ] `app/dashboard/tenant/documents/page.tsx` - Documents
- [ ] Storage policies in Supabase

**Phase 4 (Weeks 6-7)**:
- [ ] `app/api/create-payment-intent/route.ts` - Expand
- [ ] `components/payments/StripePaymentForm.tsx` - Create
- [ ] `app/dashboard/landlord/payments/page.tsx` - Create
- [ ] Payment services in `lib/services/`

**Phase 5 (Week 8+)**:
- [ ] `app/dashboard/*/maintenance/page.tsx` - Tickets
- [ ] `app/dashboard/*/analytics/page.tsx` - Dashboards

---

## 🚀 LAUNCH CHECKLIST (Pre-MVP Release)

### Infrastructure
- [ ] Supabase project configured (prod + dev)
- [ ] Stripe account connected (prod keys)
- [ ] SendGrid configured for emails
- [ ] Vercel deployment working
- [ ] Environment variables set
- [ ] Database backups configured

### Features
- [ ] All 5 roles working
- [ ] Landlord onboarding complete
- [ ] Property/unit management complete
- [ ] Tenant invitations working
- [ ] Tenant dashboard functional
- [ ] Document system working
- [ ] Payments (Stripe) working
- [ ] Manual payments working
- [ ] Maintenance tickets working
- [ ] Basic analytics working

### Quality
- [ ] All E2E tests passing
- [ ] No console errors in prod
- [ ] No broken pages
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Mobile responsiveness verified

### Legal/Compliance
- [ ] Privacy policy page live
- [ ] Terms of service page live
- [ ] Data handling documented
- [ ] GDPR compliance reviewed

---

## 🔗 REFERENCES

- See `REQUIREMENTS_TRACKER.md` for detailed status of each requirement
- See `ACTION_PLAN.md` for timeline and effort estimates
- See `DEPLOYMENT_READY_CHECKLIST.md` for deployment requirements
- See `guide/03_developer_notes.md` for technical reference

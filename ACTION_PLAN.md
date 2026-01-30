# 🎯 ACTION PLAN - Nook MVP Development

**Created**: January 27, 2026  
**Timeline**: 8 Weeks (Weeks 1-8)  
**Target**: Production-Ready MVP

---

## 📌 STRATEGIC OVERVIEW

This action plan sequences MVP feature development into logical phases, balancing:
- **User Value**: Revenue-generating and user-facing features first
- **Technical Complexity**: Build foundation for later features
- **Risk Reduction**: Address critical blockers early
- **Team Efficiency**: Parallel workstreams where possible

**Current State**: ~48% complete. Infrastructure solid, business features incomplete.

---

## PHASE 1: STABILIZE CORE (Week 1)

**Goal**: Ensure authentication, roles, and basic platform stability.

### Tasks (Priority: 🔴 CRITICAL)

#### 1.1 Fix Role-Based Access Control
**Owner**: Backend Lead  
**Effort**: 5 days  
**Files to Update**:
- `app/auth/callback/route.ts` - Verify all 5 role redirects
- `middleware.ts` - Add comprehensive route protection
- `components/providers/auth-provider.tsx` - Fix error handling

**Acceptance Criteria**:
- [ ] Tenant login → `/dashboard/tenant` ✅
- [ ] Landlord login → `/dashboard/landlord` ✅
- [ ] Manager login → `/dashboard/manager` ✅
- [ ] Super login → `/super/dashboard` ✅
- [ ] Admin login → `/admin/dashboard` ✅
- [ ] Unauthenticated user → redirect to `/login`
- [ ] API endpoints reject unauthorized users

**Blockers**: None

---

#### 1.2 Fix Database RLS (Re-enable Gradually)
**Owner**: Database Lead  
**Effort**: 5 days  
**Critical**: YES

**Plan**:
1. Create RLS policy test suite
2. Re-enable RLS on `users` table (simplest)
3. Test thoroughly
4. Move to `organizations` table
5. Document lessons learned
6. Create runbook for future RLS updates

**Acceptance Criteria**:
- [ ] `users` table RLS enabled and tested
- [ ] `organizations` table RLS enabled and tested
- [ ] All tenant access tests passing
- [ ] All landlord access tests passing
- [ ] RLS policy documentation created

**Note**: See `DEPLOYMENT_READY_CHECKLIST.md` - RLS was disabled for stability. Re-enable carefully.

---

#### 1.3 Verify All Pages Render & Navigation Works
**Owner**: Frontend Lead  
**Effort**: 3 days

**Checklist**:
- [ ] Verify build succeeds: `npm run build`
- [ ] Verify no TS errors
- [ ] Verify ESLint passes
- [ ] Test all main navigation paths
- [ ] Identify and fix broken links/dead buttons

**Tests**:
```bash
npm run build
npm run test:e2e -- tests/e2e/smoke
```

---

### Deliverables (End of Week 1)
- ✅ All roles route to correct dashboards post-login
- ✅ Initial RLS policies re-enabled and tested
- ✅ No broken pages or navigation
- ✅ Build passes all checks
- ✅ E2E smoke tests passing

---

## PHASE 2: ONBOARDING & PROPERTY SETUP (Weeks 2-3)

**Goal**: Enable landlords to sign up and configure properties/units.

### Tasks (Priority: 🔴 CRITICAL)

#### 2.1 Complete Landlord Onboarding Wizard
**Owner**: Frontend Lead  
**Effort**: 8 days  
**Files**: `app/dashboard/landlord/onboarding/**`

**Steps**:
1. **Step 1**: Create property (name, address, type, num_units)
2. **Step 2**: Create units (unit_number, bedrooms, bathrooms, monthly_rent)
3. **Step 3**: Configure payment methods (enable/disable Stripe, manual options)
4. **Step 4**: Add staff (invite manager/super - optional MVP)
5. **Step 5**: Add tenants (invite or manual add)

**Implementation Approach**:
- Use shadcn Dialog component for wizard
- Progress indicator showing current step
- Save to database after each step (not just on completion)
- Allow returning to edit steps

**Acceptance Criteria**:
- [ ] Wizard UI complete and polished
- [ ] All 5 steps functional
- [ ] Properties created in database
- [ ] Units created with correct associations
- [ ] Payment methods saved per property
- [ ] Tenants can be invited via email
- [ ] Manual add creates tenants with temp password
- [ ] User can exit/resume wizard

---

#### 2.2 Improve Property/Unit Management Pages
**Owner**: Frontend Lead  
**Effort**: 5 days

**Update Pages**:
- `app/dashboard/landlord/properties/page.tsx` - Add list, create, edit, delete
- `app/dashboard/landlord/properties/[id]/page.tsx` - Property detail with units
- `app/dashboard/landlord/units/page.tsx` - Unit management

**Acceptance Criteria**:
- [ ] CRUD operations all functional
- [ ] Proper error messages
- [ ] Confirmation dialogs for delete
- [ ] Success notifications for actions
- [ ] Unit list shows key info (unit #, rent, tenant, status)

---

#### 2.3 Implement Trial System
**Owner**: Backend Lead  
**Effort**: 4 days

**Database Changes**:
```sql
ALTER TABLE organizations ADD COLUMN trial_start_date timestamptz;
ALTER TABLE organizations ADD COLUMN trial_status text DEFAULT 'active';
```

**Features**:
- Create `lib/services/trial-service.ts`
- Add middleware to check trial validity
- Create trial validation endpoint
- Add trial status widget to landlord dashboard
- Send trial expiration emails (7/3/0 days)

**Acceptance Criteria**:
- [ ] Trial auto-created on signup
- [ ] Trial period: 30 days
- [ ] Trial status displays in dashboard
- [ ] Expiration notifications sent
- [ ] Can upgrade when trial ends

---

#### 2.4 Implement Tenant Invitation System
**Owner**: Backend + Frontend  
**Effort**: 6 days

**Current State**: Table exists, email flow incomplete

**Tasks**:
- [ ] Create SendGrid integration for emails
- [ ] Create invite email template
- [ ] Implement email sending on invite creation
- [ ] Track invite acceptance
- [ ] Resend invite functionality
- [ ] Bulk import tenants (CSV)

**Acceptance Criteria**:
- [ ] Landlord can invite tenant via email
- [ ] Email sent with activation link
- [ ] Tenant can click link and sign up
- [ ] Lease created automatically
- [ ] Tenant can login immediately after

---

### Deliverables (End of Week 3)
- ✅ Landlord onboarding wizard complete
- ✅ Property/unit CRUD fully functional
- ✅ Trial system implemented
- ✅ Tenant invitations working with email
- ✅ Landlords can have fully configured properties ready for tenants

---

## PHASE 3: TENANT DASHBOARD & DOCUMENTS (Weeks 4-5)

**Goal**: Enable tenants to view units, upload documents, and track status.

### Tasks (Priority: 🔴 CRITICAL)

#### 3.1 Tenant Dashboard & Unit View
**Owner**: Frontend Lead  
**Effort**: 6 days

**Pages**:
- `app/dashboard/tenant/page.tsx` - Show assigned units
- `app/dashboard/tenant/units/[id]/page.tsx` - Unit detail with tabs:
  - Overview (lease info, contacts, payment status)
  - Rent & Payments (payment history, due dates)
  - Maintenance (ticket status)
  - Documents (tenant's documents)

**Acceptance Criteria**:
- [ ] Tenant sees only their assigned units
- [ ] Clear display of rent due, paid status
- [ ] Link to maintenance tickets
- [ ] Link to documents
- [ ] Links to payment/document sections

---

#### 3.2 Document Upload & Management
**Owner**: Full Stack  
**Effort**: 8 days

**Features**:
- Upload document with category selection (ID, Proof of Income, Bank Statement, References)
- Store in Supabase Storage: `tenant-documents/{org_id}/{tenant_id}/{doc_id}`
- Track versions (latest marked as current)
- Display status: `missing`, `uploaded`, `updated`
- Landlord can mark verified (checkbox with timestamp)

**Implementation**:
- `components/documents/DocumentUploader.tsx`
- `components/documents/DocumentList.tsx`
- `lib/services/document-service.ts` - Handle upload/download
- Update RLS policies for document access

**Database Changes**:
```sql
ALTER TABLE documents ADD COLUMN document_category text;
ALTER TABLE documents ADD COLUMN is_current boolean DEFAULT true;
ALTER TABLE documents ADD COLUMN verified_by uuid;
ALTER TABLE documents ADD COLUMN verified_at timestamptz;
```

**Acceptance Criteria**:
- [ ] Upload UI with category dropdown
- [ ] Multiple file formats supported (PDF, JPG, PNG)
- [ ] File preview for images
- [ ] PDF preview (using react-pdf or similar)
- [ ] Version history visible
- [ ] Landlord verification checkbox
- [ ] Document list filtered by category
- [ ] Proper storage security (no public access)

---

#### 3.3 Document Request System (Optional MVP)
**Owner**: Backend  
**Effort**: 4 days  
**Priority**: Medium (can be added post-MVP)

**Feature**: Landlord can request specific documents from tenant (e.g., "Please upload proof of income by Jan 31")

**Implementation**: `document_requests` table with status tracking

---

### Deliverables (End of Week 5)
- ✅ Tenant dashboard with unit overview
- ✅ Document upload and management complete
- ✅ Document verification workflow
- ✅ Tenants can manage all required documents

---

## PHASE 4: PAYMENTS (Weeks 6-7)

**Goal**: Implement rent/deposit payments with multiple payment methods.

### Tasks (Priority: 🔴 CRITICAL)

#### 4.1 Complete Stripe Integration
**Owner**: Backend Lead  
**Effort**: 6 days

**Current State**: `create-payment-intent` route exists, incomplete

**Tasks**:
- [ ] Complete payment form component with Stripe Elements
- [ ] Handle payment intent success/failure
- [ ] Store payment in database
- [ ] Send confirmation emails
- [ ] Add payment receipt generation

**Files to Create/Update**:
- `components/payments/StripePaymentForm.tsx` (new)
- `app/dashboard/tenant/payments/page.tsx` (update)
- `app/api/webhooks/stripe/route.ts` (improve existing)
- `lib/services/payment-service.ts` (expand)

**Acceptance Criteria**:
- [ ] Card payment form works
- [ ] Apple Pay/Google Pay available
- [ ] Payment confirmation email sent
- [ ] Payment stored in database
- [ ] Payment status updated to "paid"
- [ ] Error handling for failed payments
- [ ] Refund capability for landlord

---

#### 4.2 Manual Payment Methods UI
**Owner**: Full Stack  
**Effort**: 8 days

**Methods to Implement**:
1. **Bank Transfer**: Tenant marks "I paid" with bank details, landlord verifies
2. **Zelle**: Similar to bank transfer
3. **Venmo**: Tenant provides username, landlord verifies
4. **Cash App**: Similar to Venmo

**Implementation**:
- Create `PaymentMethodForm` component
- Add `manual_payments` table to track unverified payments
- Create landlord verification UI
- Track payment status: `pending`, `verified`, `rejected`

**Database Changes**:
```sql
CREATE TABLE manual_payment_verification (
  id uuid PRIMARY KEY,
  payment_id uuid REFERENCES payments,
  tenant_id uuid REFERENCES tenants,
  payment_proof_url text,
  status text, -- pending, verified, rejected
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz
);
```

**Acceptance Criteria**:
- [ ] Tenant can submit manual payment claim with optional proof
- [ ] Landlord sees pending manual payments
- [ ] Landlord can verify or reject
- [ ] Verified payments appear in payment history
- [ ] Notification emails sent on verification

---

#### 4.3 Split Rent Payment System
**Owner**: Full Stack  
**Effort**: 7 days

**Feature**: Multiple tenants contributing to one unit rent.

**Database Schema** (if not already present):
```sql
CREATE TABLE rent_splits (
  id uuid PRIMARY KEY,
  unit_id uuid REFERENCES units,
  tenant_id uuid REFERENCES tenants,
  split_amount numeric,
  due_date date,
  status text -- unpaid, pending, partially_paid, paid
);
```

**Implementation**:
- Display split amounts for each tenant
- Track who paid what
- Show remaining balance per tenant
- Create payment form that handles partial payments
- Aggregate to show unit status (partially paid, paid, overdue)

**Acceptance Criteria**:
- [ ] Split rent amounts displayed to all roommates
- [ ] Each tenant sees only their split amount
- [ ] Payment form handles partial payments
- [ ] Status shows: unpaid, pending, partially paid, paid
- [ ] Roommates can see each other's payment status
- [ ] Overdue indicator works

---

#### 4.4 Landlord Payment Dashboard
**Owner**: Frontend Lead  
**Effort**: 6 days

**Page**: `app/dashboard/landlord/payments/page.tsx`

**Features**:
- Filter by: property, unit, tenant, date range
- Status breakdown: unpaid, pending, paid, failed, overdue
- Total collected (monthly, yearly)
- List all payments with details
- Click to see payment details and receipt
- Export to CSV

**Acceptance Criteria**:
- [ ] View all org payments
- [ ] Filter and search functional
- [ ] Payment details accessible
- [ ] CSV export works
- [ ] Real-time updates (Realtime or polling)
- [ ] Manual payment verification UI integrated

---

### Deliverables (End of Week 7)
- ✅ Stripe payment processing complete
- ✅ Manual payment methods (Zelle, Venmo, Cash App, Bank Transfer)
- ✅ Split rent functionality
- ✅ Landlord payment dashboard
- ✅ Payment tracking and verification

---

## PHASE 5: MAINTENANCE TICKETS & ANALYTICS (Weeks 8+)

### 5.1 Maintenance Ticket System (Weeks 8)
**Owner**: Full Stack  
**Effort**: 8 days

**Features** (refer to REQUIREMENTS_TRACKER.md Section G):
- Tenant creates ticket with: title, category, priority, description, photos
- Comment thread with real-time updates
- Upvote/voting system
- Landlord/Super assigns and updates status
- Internal notes (landlord-only)
- Auto-notifications on updates

**Tasks**:
- [ ] Create ticket creation form
- [ ] Add photo upload to Supabase
- [ ] Create ticket detail page with comments
- [ ] Implement real-time updates (Supabase Realtime)
- [ ] Create assignment workflow
- [ ] Add internal notes system
- [ ] Dashboard for landlord (filter by status, property, unit)
- [ ] Dashboard for super (assigned tickets, status updates)

---

### 5.2 Analytics & Reporting (Weeks 8+)
**Owner**: Data + Frontend  
**Effort**: 10 days

**Dashboards to Build**:
1. **Unit Dashboard**: Rent status, payment methods, maintenance tickets
2. **Property Dashboard**: Total collected, overdue units, ticket volume
3. **Org Dashboard**: Multi-property rollups, 30/60/90 day trends

**Tools**: Recharts or Chart.js for visualizations

**Metrics** (from REQUIREMENTS_TRACKER.md Section H):
- Revenue collected
- Split rent breakdowns
- Payment method distribution
- Ticket volume and categories
- Time-to-resolution trends

---

## 🔴 CRITICAL PATH

**Must Complete Before Launch** (In Order):
1. ✅ Fix role-based access control (Phase 1)
2. ✅ Re-enable RLS safely (Phase 1)
3. ✅ Landlord onboarding wizard (Phase 2)
4. ✅ Property/unit management (Phase 2)
5. ✅ Tenant invitations with email (Phase 2)
6. ✅ Tenant dashboard (Phase 3)
7. ✅ Document upload/management (Phase 3)
8. ✅ Stripe payments (Phase 4)
9. ✅ Manual payments (Phase 4)
10. ✅ Landlord payment dashboard (Phase 4)
11. ✅ Maintenance ticket system (Phase 5)
12. Analytics (Phase 5) - Lower priority, can be basic

---

## ⏱️ TIMELINE SUMMARY

| Phase | Duration | End State | Status |
|-------|----------|-----------|--------|
| **Phase 1: Stabilize Core** | Week 1 | Auth/roles working, RLS re-enabled | Critical |
| **Phase 2: Onboarding & Properties** | Weeks 2-3 | Landlords can set up properties | Critical |
| **Phase 3: Tenant Dashboard & Docs** | Weeks 4-5 | Tenants can view units & upload docs | Critical |
| **Phase 4: Payments** | Weeks 6-7 | Full payment system with multiple methods | Critical |
| **Phase 5: Maintenance & Analytics** | Weeks 8+ | Ticket system & basic dashboards | Important |

**MVP Launch Target**: End of Week 7 (core features + payments working)

---

## 📊 EFFORT ESTIMATES

| Phase | Days | Full-Time Team | Notes |
|-------|------|-----------------|-------|
| Phase 1 | 13 | 2 devs | Critical, blocking other phases |
| Phase 2 | 23 | 2-3 devs | Parallel: Frontend + Backend |
| Phase 3 | 14 | 2 devs | Parallel possible |
| Phase 4 | 27 | 2-3 devs | Longest phase, highest complexity |
| Phase 5 | 18+ | 2 devs | Can run in parallel with Phase 4 |
| **Total** | **~95 days** | **2-3 devs** | **~4-5 weeks with full team** |

---

## 🎯 SUCCESS METRICS

### Phase 1 Success
- [ ] All role-based redirects working
- [ ] No 500 errors in production
- [ ] RLS policies re-enabled on 2+ tables
- [ ] All E2E smoke tests passing

### Phase 2 Success
- [ ] First landlord can complete full onboarding
- [ ] Properties and units created
- [ ] Tenant invitation emails sent and opened
- [ ] 10+ properties in seed data

### Phase 3 Success
- [ ] Tenants see correct unit information
- [ ] Document upload and download working
- [ ] File previews for PDFs and images
- [ ] Landlord can verify documents

### Phase 4 Success
- [ ] Test Stripe payment successful
- [ ] Manual payment verification working
- [ ] Split rent calculates correctly
- [ ] Landlord dashboard shows all payment data

### Phase 5 Success
- [ ] Maintenance ticket creation to resolution
- [ ] Real-time comment updates working
- [ ] All analytics metrics displaying
- [ ] Export functionality operational

---

## 🚀 POST-LAUNCH (Future Phases)

**Phase 6: Polish & Optimization** (Week 9)
- [ ] Performance optimization
- [ ] Mobile UX refinement
- [ ] Comprehensive test coverage (80%+)
- [ ] Security audit and hardening

**Phase 7: Features & Integrations** (Week 10+)
- [ ] PayPal integration
- [ ] Advanced analytics (predictive, custom reports)
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] SMS notifications
- [ ] Slack integration

---

## 📝 DEPENDENCIES & BLOCKERS

### External Dependencies
- SendGrid API credentials (for email)
- Stripe production keys (for payments)
- AWS S3 (for storage, if not using Supabase)
- Environment variables properly configured

### Internal Blockers
- RLS re-enablement (Phase 1) blocks later security work
- Trial system (Phase 2) blocks upgrade flow
- Payment system (Phase 4) blocks revenue

### Team Dependencies
- Backend developer: API/database work
- Frontend developer: UI/component work
- DevOps/Database: RLS policies, migrations

---

## 🔄 WEEKLY CHECK-INS

Recommended cadence:
- **Monday**: Review prior week, set week goals
- **Wednesday**: Mid-week sync, identify blockers
- **Friday**: Demo completed work, plan next week

---

## 📚 DOCUMENTATION

All tasks should include:
- PR description with context
- Updated REQUIREMENTS_TRACKER.md
- Code comments for complex logic
- Test coverage (unit + E2E)
- Database migration if schema changes

---

## 🎓 NEXT STEPS

1. **Review & Approve**: Team reviews and approves plan
2. **Setup Sprints**: Organize tasks into 1-week sprints
3. **Assign Owners**: Assign each task to developer
4. **Track Progress**: Use GitHub issues/projects for tracking
5. **Daily Standups**: 15-min daily sync on progress

---

**Created**: January 27, 2026  
**Next Review**: End of Week 1 (after Phase 1)  
**Update Frequency**: Weekly after each phase

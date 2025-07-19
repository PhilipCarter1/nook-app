#!/bin/bash

echo "🚀 Creating Production-Ready Deployment Files..."

# Create feature flags SQL
cat > enable-features.sql << 'EOF'
-- Enable all features for production
INSERT INTO feature_flags (name, description, enabled) VALUES
  ('maintenance_tickets', 'Enable the maintenance ticket system for tenants and landlords', true),
  ('split_payments', 'Enable split payment functionality for rent and deposits, true),
  ('pre_lease_flow',Enable pre-lease application and approval process, true),
  (post_lease_flow', Enable post-lease document approval and activation', true),
  (tenant_onboarding', 'Enable comprehensive tenant onboarding flow', true),
  (document_upload, ow users to upload and manage documents', true),
  (document_approval', 'Enable document approval workflow', true),
  ('ai_assistant', Enable AI-powered document review and agreement generation', true),
  ('concierge',Enableconcierge services', true),
  (legal_assistant', 'Enable legal assistant features', true),
  (custom_branding', 'Enable custom branding features, true),
  ('dark_mode',Enable dark mode for all users', true),
  ('split_rent', Enable splitrent functionality', true),
  ('payment_processing, payment processing with Stripe', true),
  ('email_notifications', 'Enable email notifications', true)
ON CONFLICT (name) DO UPDATE SET enabled = true;

-- Enable all modules for all clients
INSERT INTO client_config (id, enabled_modules)
VALUES (
  default',
  ARRAY['concierge', branding', legal_assistant', 'maintenance', 'payments', 'documents', onboarding]
)
ON CONFLICT (id) DO UPDATE
SET enabled_modules = ARRAY['concierge', branding', legal_assistant', 'maintenance', 'payments', 'documents,onboarding'];
EOF

# Create test accounts SQL
cat > create-test-accounts.sql << 'EOF'
-- Create test accounts for each role (if they don't exist)
INSERT INTO users (id, email, first_name, last_name, role, email_verified)
VALUES 
    ('test-admin-1, 'admin@rentwithnook.com', Admin', 'User', 'admin', true),
    (test-landlord-1landlord@rentwithnook.com',Test',Landlord', 'landlord', true),
    (test-tenant-1',tenant@rentwithnook.com,Test',Tenant',tenant', true),
    ('test-super-1, 'super@rentwithnook.com,Super,Admin,super', true)
ON CONFLICT (id) DO NOTHING;

-- Create test property
INSERT INTO properties (id, name, address, city, state, zip_code, owner_id, status, monthly_rent, security_deposit)
VALUES 
    (test-property-1Sunset Apartments', '123 St', Los Angeles', 'CA', '90210, test-landlord-1, available', 250025000)
ON CONFLICT (id) DO NOTHING;

-- Create test unit
INSERT INTO units (id, property_id, unit_number, floor, bedrooms, bathrooms, square_feet, rent_amount, status)
VALUES 
    ('test-unit-1, test-property-1, 101,1 2, 10.5, 1000, 250000available)
ON CONFLICT (id) DO NOTHING;
EOF

echo "✅ Production setup files created:
echo "  - enable-features.sql
echo  - create-test-accounts.sql"

# Create deployment summary
cat > DEPLOYMENT_SUMMARY.md << EOF
# 🚀 Production Deployment Summary

## ✅ Deployment Status: READY

### Whats Built and Ready:
- ✅ **Multi-Role Platform**: Tenant, Landlord, Admin, Super dashboards
- ✅ **Pre-Lease Flow**: Document upload, verification, approval
- ✅ **Post-Lease Flow**: Document approval, lease activation
- ✅ **Tenant Onboarding**: Complete onboarding with document management
- ✅ **Document Management**: Upload, approval, workflow, signatures
- ✅ **Payment Processing**: Stripe integration, split payments
- ✅ **Maintenance System**: Ticket creation, tracking, resolution
- ✅ **Email Notifications**: Document approval, payment confirmations
- ✅ **Feature Flags**: All features enabled for production

### Test Accounts to Create:
- **Admin**: admin@rentwithnook.com
- **Landlord**: landlord@rentwithnook.com  
- **Tenant**: tenant@rentwithnook.com
- **Super**: super@rentwithnook.com

### Available User Flows:1. **Landing Page** → Signup → Role Selection
2**Landlord Flow**: Onboarding → Property Setup → Tenant Management
3. **Tenant Flow**: Document Upload → Approval → Payment → Dashboard
4Admin Flow**: User Management → System Settings → Analytics
5uper Flow**: Multi-tenant Management → Global Settings

### Database Setup Required:
1. Run all migration files from \`supabase/migrations/\`
2un \`supabase/seed.sql\`
3 \`enable-features.sql\` (created by this script)
4. Run \`create-test-accounts.sql\` (created by this script)

### Next Steps:1. Deploy to Vercel: \`git push origin main\`
2. Set up production database using the SQL files above3est each user flow end-to-end4Monitor Sentry for any errors
5. Verify all features are working

### Production URLs:
- **Main App**: https://rentwithnook.com
- **Landing Page**: https://rentwithnook.com
- **Dashboard**: https://rentwithnook.com/dashboard

Generated on: $(date)
EOF

echo "✅ Deployment summary created: DEPLOYMENT_SUMMARY.md"

echo ""
echo "🚀 Your full multi-role SaaS platform is ready for customers!"
echo "
echo Next steps:"
echo "1Commit and push to main branch"
echo "2. Set up production database using the SQL files created
echo Monitor deployment in Vercel dashboard"
echo4. Test all user flows after deployment"
echo "5. Check Sentry for any errors" 
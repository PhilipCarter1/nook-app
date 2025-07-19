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

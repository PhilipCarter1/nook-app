#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Setting up preview environment...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "${GREEN}Creating .env.local...${NC}"
  cp .env.example .env.local
fi

# Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
psql $DATABASE_URL -f supabase/migrations/20240321000000_tenant_post_lease.sql
psql $DATABASE_URL -f supabase/migrations/20240321000001_admin_features.sql
psql $DATABASE_URL -f supabase/migrations/20240321000002_payment_config.sql
psql $DATABASE_URL -f supabase/migrations/20240321000003_module_config.sql

# Seed the database
echo -e "${GREEN}Seeding the database...${NC}"
psql $DATABASE_URL -f supabase/seed.sql

# Create test users in Supabase Auth
echo -e "${GREEN}Creating test users...${NC}"

# Create tenant user
curl -X POST 'https://$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Test User",
      "role": "tenant"
    }
  }'

# Create landlord user
curl -X POST 'https://$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "password": "test123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Test Landlord",
      "role": "landlord"
    }
  }'

echo -e "${BLUE}Preview environment setup complete!${NC}"
echo -e "${GREEN}You can now test the application with the following accounts:${NC}"
echo ""
echo -e "${BLUE}Tenant Account:${NC}"
echo "Email: test@example.com"
echo "Password: test123"
echo ""
echo -e "${BLUE}Landlord Account:${NC}"
echo "Email: landlord@example.com"
echo "Password: test123"
echo ""
echo -e "${BLUE}Available Features:${NC}"
echo "- Concierge services"
echo "- Branding customization"
echo "- Legal Assistant (Beta)"
echo "- Payment processing (Stripe, PayPal, Bank Transfer)"
echo "- Maintenance ticketing"
echo "- Document management"
echo ""
echo -e "${BLUE}Preview URL:${NC}"
echo "https://$VERCEL_URL" 
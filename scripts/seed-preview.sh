#!/bin/bash

# Get the preview URL from the environment
PREVIEW_URL=${VERCEL_URL:-"localhost:3000"}

# Run the seed file
psql $DATABASE_URL -f supabase/seed.sql

echo "Seed data has been applied to the preview environment at $PREVIEW_URL"
echo "You can now test the application with the following accounts:"
echo ""
echo "Tenant Account:"
echo "Email: test@example.com"
echo "Password: test123"
echo ""
echo "Landlord Account:"
echo "Email: landlord@example.com"
echo "Password: test123" 
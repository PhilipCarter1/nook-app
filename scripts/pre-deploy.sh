#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting pre-deployment checks...${NC}"

# Skip environment variable checks if running locally
if [ "$CI" != "true" ]; then
  echo -e "\n${BLUE}Skipping environment variable checks (running locally)...${NC}"
  echo -e "${BLUE}Note: Make sure to set all required environment variables in Vercel before deployment.${NC}"
else
  # Check for required environment variables
  echo -e "\n${BLUE}Checking environment variables...${NC}"
  required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "RESEND_API_KEY"
    "SENDGRID_API_KEY"
    "NEXT_PUBLIC_SENTRY_DSN"
    "NEXT_PUBLIC_APP_URL"
    "NEXT_PUBLIC_APP_NAME"
    "NEXT_PUBLIC_APP_DESCRIPTION"
    "NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT"
    "NEXT_PUBLIC_ENABLE_CONCIERGE"
    "NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING"
  )

  missing_vars=0
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo -e "${RED}Missing environment variable: $var${NC}"
      missing_vars=1
    else
      echo -e "${GREEN}✓ $var is set${NC}"
    fi
  done

  if [ $missing_vars -eq 1 ]; then
    echo -e "\n${RED}Please set all required environment variables before deploying.${NC}"
    exit 1
  fi
fi

# Run linting
echo -e "\n${BLUE}Running linting...${NC}"
npm run lint -- --max-warnings 1000
if [ $? -ne 0 ]; then
  echo -e "${RED}Linting failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

# Run type checking
echo -e "\n${BLUE}Running type checking...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Type checking failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

# Run tests
echo -e "\n${BLUE}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}Tests failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

# Check for uncommitted changes
echo -e "\n${BLUE}Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}You have uncommitted changes. Please commit or stash them before deploying.${NC}"
  exit 1
fi

# Check if we're on the main branch
echo -e "\n${BLUE}Checking current branch...${NC}"
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo -e "${RED}You are not on the main branch. Please switch to main before deploying.${NC}"
  exit 1
fi

# Pull latest changes
echo -e "\n${BLUE}Pulling latest changes...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to pull latest changes. Please resolve any conflicts before deploying.${NC}"
  exit 1
fi

echo -e "\n${GREEN}All pre-deployment checks passed! You can now deploy your application.${NC}"
echo -e "\n${BLUE}Deployment Checklist:${NC}"
echo "1. Environment variables are set in Vercel"
echo "2. Database migrations are up to date"
echo "3. Stripe webhook is configured"
echo "4. Sentry error tracking is set up"
echo "5. Custom domain is configured (if applicable)"
echo "6. SSL certificate is valid"
echo "7. Security headers are properly configured"
echo "8. SEO meta tags are set"
echo "9. Analytics is configured"
echo "10. Backup strategy is in place" 
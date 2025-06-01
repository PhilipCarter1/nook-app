#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting deployment process...${NC}"

# Run pre-deployment checks
echo -e "\n${BLUE}Running pre-deployment checks...${NC}"
./scripts/pre-deploy.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}Pre-deployment checks failed. Please fix the issues before deploying.${NC}"
  exit 1
fi

# Create a deployment branch
echo -e "\n${BLUE}Creating deployment branch...${NC}"
timestamp=$(date +%Y%m%d_%H%M%S)
deployment_branch="deploy_${timestamp}"
git checkout -b $deployment_branch

# Commit any changes
echo -e "\n${BLUE}Committing changes...${NC}"
git add .
git commit -m "Prepare for deployment [skip ci]"

# Push to deployment branch
echo -e "\n${BLUE}Pushing to deployment branch...${NC}"
git push origin $deployment_branch

# Create pull request to main
echo -e "\n${BLUE}Creating pull request to main...${NC}"
gh pr create --base main --head $deployment_branch --title "Deployment $(date +%Y-%m-%d)" --body "Deployment preparation"

echo -e "\n${GREEN}Deployment preparation complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Review the pull request"
echo "2. Ensure all environment variables are set in Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - RESEND_API_KEY"
echo "   - SENDGRID_API_KEY"
echo "   - NEXT_PUBLIC_SENTRY_DSN"
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - NEXT_PUBLIC_APP_NAME"
echo "   - NEXT_PUBLIC_APP_DESCRIPTION"
echo "   - NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT"
echo "   - NEXT_PUBLIC_ENABLE_CONCIERGE"
echo "   - NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING"
echo "3. Merge the pull request to trigger deployment"
echo "4. Monitor the deployment in Vercel dashboard"
echo "5. Run post-deployment tests" 
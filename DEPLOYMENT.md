# Deployment Guide

## Pre-deployment Checklist

- [ ] All environment variables are set in Vercel and GitHub secrets
- [ ] Database migrations are up to date
- [ ] All tests, lint, and type checks pass (`./scripts/pre-deploy.sh`)
- [ ] Code reviewed and merged via Pull Request

## Deployment Process

1. All deployments are managed by `.github/workflows/deploy.yml` (GitHub Actions)
2. Only the `main` branch deploys to production (Vercel)
3. Pre-deployment checks are automated via `./scripts/pre-deploy.sh`
4. Monitor deployment in Vercel dashboard
5. Post-deployment: verify all critical user flows, monitor Sentry and Supabase

## Rollback Plan
- Use Vercel's rollback feature to revert to a previous deployment
- Restore database from backup if needed
- Document and test rollback steps regularly

## Monitoring
- Use Sentry for error tracking
- Monitor Vercel and Supabase dashboards for performance and errors
- Set up alerts for high error rates, failed payments, and downtime

## Maintenance
- Regularly update dependencies
- Review and address technical debt
- Run post-deployment QA and smoke tests

## Emergency Contacts
- Database administrator
- DevOps team
- Security team
- Payment processing team
- Customer support team 
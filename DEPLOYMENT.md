# Deployment Guide

## Pre-deployment Checklist

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `RESEND_API_KEY` - Resend API key for email
- [ ] `SENDGRID_API_KEY` - SendGrid API key for email
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL
- [ ] `NEXT_PUBLIC_APP_NAME` - Application name
- [ ] `NEXT_PUBLIC_APP_DESCRIPTION` - Application description
- [ ] `NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT` - Feature flag for legal assistant
- [ ] `NEXT_PUBLIC_ENABLE_CONCIERGE` - Feature flag for concierge service
- [ ] `NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING` - Feature flag for custom branding

### Database
- [ ] All migrations are up to date
- [ ] Database schema matches the application's expectations
- [ ] Backup strategy is in place
- [ ] Database indexes are optimized
- [ ] Row Level Security (RLS) policies are properly configured

### Security
- [ ] Security headers are properly configured in `vercel.json`
- [ ] SSL certificate is valid
- [ ] API routes are properly protected
- [ ] Authentication flows are tested
- [ ] Rate limiting is implemented
- [ ] CORS policies are properly configured

### Third-party Services
- [ ] Stripe webhook is configured and tested
- [ ] Sentry error tracking is set up
- [ ] Email service (Resend/SendGrid) is configured
- [ ] Analytics is configured (if applicable)
- [ ] CDN is configured (if applicable)

### Application
- [ ] All tests are passing
- [ ] No type errors
- [ ] No linting errors
- [ ] Build succeeds locally
- [ ] SEO meta tags are set
- [ ] Performance metrics are acceptable
- [ ] Mobile responsiveness is verified
- [ ] Accessibility requirements are met

### Deployment Process
1. Run the pre-deployment script:
   ```bash
   ./scripts/pre-deploy.sh
   ```

2. Verify all checks pass

3. Push to main branch:
   ```bash
   git push origin main
   ```

4. Monitor Vercel deployment:
   - Check build logs
   - Verify environment variables
   - Confirm successful deployment

5. Post-deployment verification:
   - Test authentication flows
   - Verify email functionality
   - Check payment processing
   - Monitor error tracking
   - Verify analytics

### Rollback Plan
1. Keep track of the last known good deployment
2. Document any database changes
3. Have a rollback script ready
4. Test rollback procedure

## Monitoring

### Key Metrics to Monitor
- Application performance
- Error rates
- API response times
- Database performance
- Payment success rates
- Email delivery rates

### Alerts
- Set up alerts for:
  - High error rates
  - Failed payments
  - Database connection issues
  - API endpoint failures
  - SSL certificate expiration

## Maintenance

### Regular Tasks
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify backup integrity
- [ ] Update dependencies
- [ ] Review security headers
- [ ] Check SSL certificate status

### Emergency Contacts
- Database administrator
- DevOps team
- Security team
- Payment processing team
- Customer support team 
# Supabase & Platform Setup After Adding Missing ENV Values

**Date**: February 3, 2026

This document explains, step-by-step, what to do in Supabase and other platforms (Vercel, GitHub, Resend, Stripe, DNS) after you've put all missing environment values into your `.env.local` and project secrets. The project uses the env var name `SENDGRID_API_KEY` to hold the Resend API key (per your request).

Contents
- Quick overview
- Local `.env.local` checklist
- Supabase (project) steps
- Supabase Edge Functions
- Vercel (deployment)
- GitHub Actions / Workflows
- Resend setup (domain verification, API key)
- Stripe webhooks and keys
- DNS changes (SPF, DKIM for Resend)
- Testing & verification steps
- Rollout checklist

---

## Quick overview
1. Add the missing secrets to your local `.env.local` (SENDGRID_API_KEY will hold the Resend key).
2. Add the same secrets to Supabase Project Settings (ENV) and any Edge Functions.
3. Add the same secrets to Vercel / GitHub secrets for deployments.
4. Configure Resend (API key, verify sending domain, add DNS records).
5. Configure Stripe webhook secret in envs and in Stripe dashboard.
6. Verify storage and RLS policies in Supabase.
7. Run verification SQL scripts and test flows (signup, invite, emails, payments).

---

## Local `.env.local` checklist (what to fill)
- `SENDGRID_API_KEY` — PUT your Resend API key here (Resend key, not SendGrid). Keep the name `SENDGRID_API_KEY`.
- `EMAIL_FROM` — Verified from address (e.g. `noreply@yourdomain.com`). Must match the sending domain in Resend.
- `STRIPE_SECRET_KEY` — Stripe secret key (test or live depending on environment).
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (for webhooks verification).
- `NEXT_PUBLIC_APP_URL` — Your app URL (http://localhost:3000 for dev, https://yourdomain.com for prod).
- Optional: `OPENAI_API_KEY` (if you use legal assistant), `RESEND_API_KEY` (fallback if you prefer), `REDIS_URL`.

Important: That variable name (`SENDGRID_API_KEY`) is used in code now as the Resend key.

---

## Supabase: Project Settings - Environment Variables
1. Open your Supabase Project → Settings → Environment Variables / API Keys (or Project Settings → Environment Variables).
2. Add the following keys (value = same value as `.env.local`):
   - `SENDGRID_API_KEY` → Resend API key
   - `SUPABASE_SERVICE_ROLE_KEY` → service role key (already present)
   - `DATABASE_URL` / `DRIZZLE_DB_URL` → if needed for server builds/functions
   - `STRIPE_SECRET_KEY` → stripe secret
   - `STRIPE_WEBHOOK_SECRET` → stripe webhook secret (used by serverless functions)
   - `EMAIL_FROM` → from address
   - Any other secret your Supabase Edge Functions need

Notes:
- Edge Functions can read `Deno.env.get('SENDGRID_API_KEY')` (we updated the `send-payment-reminder` function to check `SENDGRID_API_KEY` first).
- For environment variables that should not be public, set them in Project Settings as "Protected" or the equivalent so they are not exposed to client code.

---

## Supabase: Storage and RLS
1. Storage buckets
   - In Supabase Dashboard → Storage → Buckets, verify your buckets (`documents`, `tenant-documents`) exist.
   - Ensure `public` is set to `false` for private docs.
   - If your .env `STORAGE_BUCKET` differs, update it.

2. RLS Policies (Row Level Security)
   - RLS should be enabled for critical tables (users, properties, units, leases, documents, payments, maintenance_tickets)
   - To re-enable RLS safely:
     a. Run diagnostic queries (see `complete-picture.sql` or `check-all-table-structures.sql`) to confirm schema.
     b. If RLS is disabled, enable RLS on a single table at a time, then apply and test policies.
     c. Use `connect-existing-tables.sql` to enable RLS on all tables, but review the policy definitions first.
   - Verify policies: `SELECT * FROM pg_policies WHERE tablename = 'documents';`

3. Service Role
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Only use on server-side or admin functions.

---

## Supabase Edge Functions
1. Environment variables
   - Add `SENDGRID_API_KEY` to Edge Function's environment (or set it at the project level so functions inherit it).
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for any function performing admin actions.

2. Permissions & CORS
   - If functions are called from your frontend, ensure CORS headers are configured (we provide `corsHeaders` in functions).

3. Deploy & test
   - Deploy the Edge Function after changing envs. Test sending a reminder (call the function with sample JSON) to verify email sending works.

---

## Vercel (production) or other hosting
1. Add environment variables to Vercel (Dashboard → Project → Settings → Environment Variables):
   - `SENDGRID_API_KEY` (Resend key)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `DATABASE_URL` / `DRIZZLE_DB_URL` (if server-side build needs it)
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL`

2. Mark server-only keys as `Encrypted` and set them for the correct environments (Preview, Production, Development as needed).

3. For Next.js serverless functions, set the variables in the dashboard so they are available at build/runtime.

---

## GitHub Actions / Workflows
1. Add secrets to GitHub repository settings → Secrets → Actions:
   - `SENDGRID_API_KEY` (Resend API key)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Update workflow files to pass secrets into deploy steps (if necessary). Many projects use Vercel/GitHub integration so Vercel's envs are the source of truth.

---

## Resend (Email service) setup - step-by-step
1. Create account: https://resend.com
2. Generate an API key:
   - Navigate to Dashboard → API keys → Create new key
   - Copy the key into: `.env.local` → `SENDGRID_API_KEY`
   - Also add same to Supabase and Vercel Secrets
3. Verify your sending domain (recommended):
   - Dashboard → Sending domains → Add domain `yourdomain.com`
   - Resend will provide DNS records (SPF / DKIM / TXT). You'll need to add them to your DNS provider (see DNS section below)
4. Verify the `From` address:
   - Use the same domain as verified sending domain, e.g. `noreply@yourdomain.com`
   - Put `EMAIL_FROM=noreply@yourdomain.com` in all envs
5. Webhooks (optional but recommended):
   - If you want to track bounces/deliverability, configure Resend webhooks to your app's endpoint.
   - Add the webhook endpoint URL in Resend Dashboard and copy the signing secret if needed.
   - Store the webhook secret in envs (e.g., `RESEND_WEBHOOK_SECRET`) and verify payloads in your server.
6. Testing sending:
   - Send a test email from code (e.g., call an endpoint that triggers email) and check Resend dashboard for activity.

---

## Stripe - webhook setup
1. You are using a Supabase Edge Function for Stripe webhooks:
   - Function URL: `https://xnjbyeuepdbcuweylljn.supabase.co/functions/v1/clever-function` (your endpoint)
   - This is an alternative to a Next.js API route and works perfectly fine with Stripe webhooks
2. In Stripe Dashboard:
   - Go to Webhooks → Add endpoint
   - Paste your function URL: `https://xnjbyeuepdbcuweylljn.supabase.co/functions/v1/clever-function`
   - Select events your function handles (e.g., `checkout.session.completed`, `payment_intent.succeeded`, `invoice.payment_failed`)
   - Click Create webhook
3. Copy the webhook signing secret (starts with `whsec_...`)
4. Add to all environments as `STRIPE_WEBHOOK_SECRET`:
   - `.env.local` (development)
   - Supabase Project Settings → Environment Variables
   - Vercel environment variables (if deploying there)
   - GitHub Actions secrets (if using CI/CD)
5. Ensure your `clever-function` Edge Function:
   - Reads `process.env.STRIPE_WEBHOOK_SECRET` or `Deno.env.get('STRIPE_WEBHOOK_SECRET')`
   - Validates webhook signature using the secret (prevents tampering)
   - Processes the event (e.g., updates payment status in database, sends confirmations)
   - Returns `200 OK` to Stripe on success (Stripe expects this)

---

## DNS changes (for Resend sending domain)
1. Add SPF record (if provided by Resend), example:
   - Type: TXT
   - Name: @
   - Value: `v=spf1 include:mailgun.org ~all` (replace with Resend-provided value)
2. Add DKIM CNAME records (Resend provides host/name/value pairs)
3. Add MX records if using inbound email (not typical for outbound-only)
4. Wait for DNS propagation (can take minutes to 24+ hours)
5. Verify in Resend Dashboard (it will show the DNS verification status)

---

## Tests & Verification (after envs + DNS configured)
1. Local manual test
   - Start app locally:

```bash
npm install
npm run dev
```

   - Trigger signup / invitation flow, check logs and Resend dashboard for sent messages.
   - Trigger `send-payment-reminder` function (call its endpoint with sample JSON), confirm email sent and notification record created.

2. Edge Function test
   - From Supabase Edge Functions console, set `SENDGRID_API_KEY` env and trigger function test call.

3. Stripe test
   - Your `clever-function` Edge Function handles Stripe webhooks
   - Test locally using `stripe-cli` to forward events to your local Supabase environment, or trigger from Stripe dashboard after deploying:

```bash
# Install stripe-cli and login
# Then in Stripe Dashboard, go to Webhooks → select your endpoint → Send test event
# Choose an event like "checkout.session.completed"
# Stripe will POST to your function URL
```

   - Check your function logs in Supabase Dashboard → Functions → clever-function to see requests and verify webhook signature validation works.
   - Confirm your function updates payment records/status as expected in the database.

4. Production smoke test
   - Deploy to preview/production with envs set
   - Send a payment or invite a test user
   - Verify email delivery & that links work

---

## Rollout checklist (short)
- [ ] `SENDGRID_API_KEY` set in local, Supabase, Vercel, GitHub
- [ ] `EMAIL_FROM` uses verified domain
- [ ] Resend domain verified (DNS in place)
- [ ] `STRIPE_WEBHOOK_SECRET` set in Supabase (for `clever-function`), `.env.local`, Vercel, GitHub
- [ ] Stripe webhook endpoint configured: `https://xnjbyeuepdbcuweylljn.supabase.co/functions/v1/clever-function`
- [ ] Supabase buckets secured (public=false)
- [ ] RLS policies verified/enabled per `connect-existing-tables.sql`
- [ ] Edge functions have envs and work as expected
- [ ] Run `complete-picture.sql` and `activate-real-data.sql` to verify DB state
- [ ] Test `clever-function` receives and validates Stripe webhooks
- [ ] Run a full QA flow: signup, invite, document upload, payment

---

## Troubleshooting notes
- If emails fail and you see `401` or `invalid api key` in logs: re-check `SENDGRID_API_KEY` value in all locations.
- If emails appear in Resend dashboard but not delivered: check DKIM/SPF DNS settings and bounce logs.
- If Edge Function cannot read envs: re-deploy the function after adding envs at project level.

---

If you'd like, I can:
- Add the exact DNS records you need (copy from Resend dashboard) into a DNS management file for your provider (Cloudflare / GoDaddy / Route53).
- Add automated checks to your CI to verify presence of critical env variables before deployment.

Tell me which of those you'd like next and I'll implement.

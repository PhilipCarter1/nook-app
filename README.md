# Nook - Modern Property Management Platform

A premium SaaS web application for property management, built with Next.js, Tailwind CSS, and Supabase.

> **⚠️ IMPORTANT**: See [`guide/00_SUMMARY.md`](./guide/00_SUMMARY.md) for recent fixes and setup instructions.

## Features
- Role-based dashboards (Tenant, Landlord, Manager, Super, Admin)
- Secure payment processing with Stripe
- Document management & approval workflows
- Maintenance ticket system
- Responsive design with mobile support
- Dark mode support
- Modern UI with shadcn/ui components
- Error tracking with Sentry
- SEO optimized
- Production-ready security headers

## Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Error Tracking**: Sentry
- **Deployment**: Vercel

## Getting Started

### Step 1: Set Up Supabase
Follow the detailed guide: [`guide/01_supabase_restoration.md`](./guide/01_supabase_restoration.md)

**Quick steps**:
1. Create new Supabase project
2. Import your database backup (SQL dump)
3. Restore storage buckets
4. Get API credentials

### Step 2: Install & Configure Locally
Follow: [`guide/02_setup_instructions.md`](./guide/02_setup_instructions.md)

```bash
# 1. Clone the repository
git clone https://github.com/PhilipCarter1/nook-app.git
cd nook-app

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Fill in Supabase credentials in .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-key

# 5. Run development server
npm run dev
```

Then visit [`http://localhost:3000`](http://localhost:3000)

### Step 3: Deploy to Vercel
Follow: [`guide/04_deploy_vercel_cursor.md`](./guide/04_deploy_vercel_cursor.md)

## Documentation

All documentation is in the `guide/` directory:

| Document | Purpose |
|----------|---------|
| [`guide/00_SUMMARY.md`](./guide/00_SUMMARY.md) | **START HERE** - Overview of recent fixes |
| [`guide/01_supabase_restoration.md`](./guide/01_supabase_restoration.md) | Restore database from backup |
| [`guide/02_setup_instructions.md`](./guide/02_setup_instructions.md) | Local dev setup & deployment |
| [`guide/03_developer_notes.md`](./guide/03_developer_notes.md) | Technical reference & development guide |
| [`guide/04_deploy_vercel_cursor.md`](./guide/04_deploy_vercel_cursor.md) | Vercel & Cursor preview setup |
| [`guide/05_run_tests.md`](./guide/05_run_tests.md) | Running tests & quality checks |

- **Branching:** Use feature branches (`feature/your-feature`), keep `main` always deployable.
- **Pull Requests:** All changes must go through PRs with code review, passing CI checks (lint, type, tests).
- **Code Quality:**
  - Lint: `npm run lint`
  - Type check: `npx tsc --noEmit`
  - Unit tests: `npm run test:unit`
  - E2E tests: `npm run test:e2e`
- **Technical Debt:** Track and address in `TECHNICAL_DEBT.md`.

## Deployment

- **CI/CD:**
  - All deployments are managed by a single GitHub Actions workflow (`.github/workflows/deploy.yml`).
  - Only the `main` branch deploys to production.
  - All environment variables are managed in Vercel and GitHub secrets.
- **Pre-deployment:**
  - Run `./scripts/pre-deploy.sh` to verify build, lint, type, and tests.
- **Post-deployment:**
  - Monitor Vercel dashboard, Sentry, and Supabase for errors and performance.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request and request review
6. Ensure all CI checks pass before merging

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

## Product Roadmap & Backlog

- The product roadmap and backlog are managed in [Notion/Linear/Jira] (choose your tool).
- All features, bugs, and improvements are tracked as issues or tickets.
- Prioritize work based on user value, business goals, and technical feasibility.
- Regularly review and update the roadmap with stakeholders. 

## Pull Request & Code Review Requirements

- All changes must be submitted via Pull Request (PR).
- PRs require at least one approving review.
- All CI checks (lint, type, tests) must pass before merging.
- No direct commits to main. 

## Technical Debt Review

- Technical debt is tracked in `TECHNICAL_DEBT.md`.
- Schedule regular reviews to prioritize and address debt.
- Include debt reduction as part of each sprint or release cycle. 
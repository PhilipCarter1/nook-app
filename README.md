# Nook - Modern Property Management Platform

A premium SaaS web application for property management, built with Next.js, Tailwind CSS, and Supabase.

## Features
- Role-based dashboards (Tenant, Landlord, Admin)
- Secure payment processing with Stripe
- Document management
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
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Error Tracking**: Sentry
- **Deployment**: Vercel

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PhilipCarter1/nook-app.git
   cd nook-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase, Stripe, and other credentials as needed.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

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
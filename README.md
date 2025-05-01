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

1. Clone the repository:
   ```bash
   git clone https://github.com/PhilipCarter1/nook-app.git
   cd nook-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Stripe credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
     NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Go to [Vercel](https://vercel.com) and sign in with your GitHub account

3. Click "New Project" and import your repository

4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Install Command: npm install
   - Output Directory: .next

5. Add Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_SENTRY_DSN
   - NEXT_PUBLIC_APP_URL
   - NEXT_PUBLIC_APP_NAME
   - NEXT_PUBLIC_APP_DESCRIPTION
   - NEXT_PUBLIC_ENABLE_LEGAL_ASSISTANT
   - NEXT_PUBLIC_ENABLE_CONCIERGE
   - NEXT_PUBLIC_ENABLE_CUSTOM_BRANDING

6. Click "Deploy"

7. After deployment, configure your custom domain:
   - Go to Project Settings > Domains
   - Add your domain: rentwithnook.com
   - Follow the DNS configuration instructions

8. Set up Stripe webhook:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: https://rentwithnook.com/api/webhooks/stripe
   - Select events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy webhook signing secret to STRIPE_WEBHOOK_SECRET

9. Set up Sentry:
   - Create a new project in Sentry
   - Copy DSN to NEXT_PUBLIC_SENTRY_DSN
   - Configure error tracking in sentry.client.config.ts and sentry.server.config.ts

## Production Checklist

Before deploying to production, ensure:

1. All environment variables are set in Vercel
2. Database migrations are run in Supabase
3. Stripe webhook is configured
4. Sentry error tracking is set up
5. Custom domain is configured
6. SSL certificate is valid
7. Security headers are properly configured
8. SEO meta tags are set
9. Analytics is configured
10. Backup strategy is in place

## Project Structure

```
nook-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── payments/          # Payment pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
├── styles/               # Global styles
├── types/                # TypeScript types
└── supabase/            # Supabase migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
# Supabase Restoration Guide for Nook

This guide walks you through creating a new Supabase project and importing your database backup and storage objects to restore the previous state of your Nook application.

## Prerequisites

- Supabase account (create at https://supabase.com if you don't have one)
- Database backup SQL dump file (you mentioned you have this)
- Storage objects backup (files/folders you downloaded)
- A text editor or command line tool

## Phase 1: Create New Supabase Project

### Step 1: Create a New Project in Supabase Dashboard

1. Go to https://supabase.com and sign in to your account
2. Click **"New Project"** button
3. Fill in the project details:
   - **Name**: `nook-app` (or your preferred name)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose the region closest to your users (e.g., `us-east-1` for US)
   - **Pricing Plan**: Choose "Free" for development, or "Pro" for production
4. Click **"Create New Project"** and wait for initialization (this takes 2-3 minutes)

### Step 2: Retrieve Your Supabase Credentials

Once the project is created:

1. Navigate to **Settings → API** in the left sidebar
2. Copy and save these values (you'll need them later for `.env`):
   - **Project URL** (labeled as `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public key** (labeled as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role secret** (labeled as `SUPABASE_SERVICE_ROLE_KEY`) - Keep this secure!

3. Navigate to **Settings → Database** to retrieve:
   - **Database Password** (the one you created during project setup)
   - **Connection String** (URI format, if needed)

## Phase 2: Restore Database from Backup

### Step 1: Access the SQL Editor

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button

### Step 2: Import Your Database Backup

You have two options:

#### Option A: Direct SQL Dump Upload (Recommended)

1. In the SQL Editor, click the **"Upload SQL File"** icon (or use the file upload feature)
2. Select your database backup SQL file (e.g., `backup.sql` or similar)
3. Click **"Execute"** to run the SQL dump
4. Wait for completion and verify no errors appear

#### Option B: Manual Paste (if upload fails)

1. Open your backup SQL file in a text editor
2. Copy all the SQL content
3. Paste it into the SQL Editor query window
4. Click **"Execute"** and wait for completion

### Step 3: Verify Database Restoration

After the SQL import completes:

1. Click **"Table Editor"** in the left sidebar
2. Verify you see these tables:
   - `users` (with columns: `id`, `email`, `name`, `role`, `created_at`, etc.)
   - `properties` (property listings)
   - `maintenance_tickets` (ticket system)
   - `documents` (document approval system)
   - `payments` (payment records)
   - `leases` (lease agreements)
   - `tenants` (tenant information)
   - And other core tables

3. If tables are present and have data, your database restore was successful.

## Phase 3: Restore Storage Buckets

### Step 1: Create Storage Buckets

1. Click **"Storage"** in the left sidebar
2. Click **"New Bucket"** button
3. Create the following buckets with these settings:

   **Bucket 1: `documents`**
   - Name: `documents`
   - Visibility: **Private** (requires authentication)
   - Click **"Create Bucket"**

   **Bucket 2: `avatars`**
   - Name: `avatars`
   - Visibility: **Public** (optional, if users have public profile pictures)
   - Click **"Create Bucket"**

   **Bucket 3: `property-images`**
   - Name: `property-images`
   - Visibility: **Public**
   - Click **"Create Bucket"**

   **Bucket 4: `maintenance-uploads`**
   - Name: `maintenance-uploads`
   - Visibility: **Private**
   - Click **"Create Bucket"**

### Step 2: Upload Storage Objects

For each bucket created:

1. Click on the bucket name to open it
2. Click **"Upload Folder"** or **"Upload File"** button
3. Select the corresponding files/folders from your backup
4. Complete the upload

**Example structure to restore:**
```
documents/
  - lease-agreements/
  - verification-docs/
  
avatars/
  - user-profiles/
  
property-images/
  - listings/
  
maintenance-uploads/
  - ticket-attachments/
```

## Phase 4: Configure RLS (Row Level Security) Policies

RLS policies control data access. Your migrations should have created these, but verify:

1. Click **"Authentication"** → **"Policies"** in the left sidebar
2. For each table (`users`, `properties`, `maintenance_tickets`, etc.), verify policies exist
3. Key policies needed:
   - Users can read their own data
   - Landlords can read properties they own
   - Tenants can read leases and maintenance tickets for their properties
   - Admins have broader access

If policies are missing, you can recreate them using SQL (see migration files in `supabase/migrations/` folder in your codebase).

## Phase 5: Enable Required Extensions

In the SQL Editor, run these commands to ensure extensions are enabled:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enable JSON operations
create extension if not exists "json";

-- Enable Full Text Search (optional, for document searching)
create extension if not exists "pg_trgm";
```

## Phase 6: Test the Connection Locally

### Step 1: Update Your `.env` File

Create or update your `.env.local` file in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Step 2: Test Database Connection

In your project root, run:

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000` and try to:
1. Sign up with a test account
2. Log in
3. Check the browser console for errors

### Step 3: Verify Data Access

After logging in, verify:
- Your user appears in the `users` table (in Supabase Dashboard → Table Editor)
- Role is correctly assigned
- You can access the dashboard for your role

## Troubleshooting

### Issue: "Connection refused" or "Cannot reach database"
- **Solution**: Double-check your `NEXT_PUBLIC_SUPABASE_URL` is correct (should be `https://...`)
- Verify your credentials are copied exactly from the Supabase dashboard

### Issue: "Permission denied" or RLS errors
- **Solution**: Your RLS policies may need adjustment. Navigate to **Authentication → Policies** and temporarily relax them for testing, then tighten them later.

### Issue: Storage buckets don't exist or return 404
- **Solution**: Manually create buckets following Step 3 (Phase 3) above.

### Issue: Tables are empty or missing
- **Solution**: Re-run your SQL backup import in the SQL Editor. Ensure the entire file is pasted/uploaded.

## Next Steps

Once your Supabase project is restored:

1. Move to the **Authentication & RBAC Fixes** phase to ensure role-based redirects work correctly
2. Update your Vercel deployment with the new environment variables
3. Run end-to-end tests to verify all flows work with the new database

---

**Estimated Time**: 15-20 minutes

**Questions?** Check the Supabase documentation at https://supabase.com/docs

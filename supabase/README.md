Applying migrations and RLS policies (local + production)

This folder contains a migration template `001_create_core_tables_and_rls.sql` which creates core tables and example RLS policies.

Prerequisites:
- Install the Supabase CLI: https://supabase.com/docs/guides/cli
- Authenticate: `supabase login`
- Have `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set for the target project if applying remotely.

Apply locally (using local Postgres instance managed by Supabase CLI):

```bash
# from project root
cd supabase
supabase db remote set <YOUR_REMOTE_DB_URL>   # optional: set remote DB
supabase db push --file migrations/001_create_core_tables_and_rls.sql
```

Apply to a Supabase project using the service role key:

```bash
# set env vars (Windows PowerShell example)
$Env:SUPABASE_URL = "https://your-project.supabase.co"
$Env:SUPABASE_SERVICE_ROLE_KEY = "<SERVICE_ROLE_KEY>"

# then run
supabase sql "$(Get-Content -Raw supabase/migrations/001_create_core_tables_and_rls.sql)"
```

Notes and next steps:
- The RLS policies in the migration are templates. Review them closely and adapt to your exact RBAC model.
- The helper `pg_temp.current_user_is_admin()` is a convenience; in production you may prefer a stable function or explicit checks against an `is_admin` column.
- After applying migrations, test auth flows and webhook processing in a staging environment.

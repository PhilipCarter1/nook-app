BEGIN;

-- Add missing name columns used by the app and trigger functions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS name text;

-- Backfill `name` from `full_name` if present
UPDATE public.users
SET name = COALESCE(NULLIF(name, ''), NULLIF(full_name, ''))
WHERE (name IS NULL OR name = '');

-- Optional: ensure email index exists
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

COMMIT;

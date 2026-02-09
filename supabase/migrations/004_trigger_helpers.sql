BEGIN;

-- Helper: set updated_at on UPDATE for tables with updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Helper: lowercase user email on insert/update
CREATE OR REPLACE FUNCTION public.lowercase_user_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

-- Helper: ensure lease dates are valid
CREATE OR REPLACE FUNCTION public.validate_lease_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL) AND (NEW.end_date < NEW.start_date) THEN
    RAISE EXCEPTION 'lease end_date (%) must not be before start_date (%)', NEW.end_date, NEW.start_date;
  END IF;
  RETURN NEW;
END;
$$;

-- Helper: sync full name from first_name/last_name
CREATE OR REPLACE FUNCTION public.sync_user_full_name()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  combined text;
BEGIN
  combined := trim(coalesce(NEW.first_name, '') || ' ' || coalesce(NEW.last_name, ''));
  IF combined <> '' THEN
    NEW.name := combined;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers to tables
-- Users: lowercase email, sync full name, update updated_at
DROP TRIGGER IF EXISTS trg_users_lowercase_email ON public.users;
CREATE TRIGGER trg_users_lowercase_email
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.lowercase_user_email();

DROP TRIGGER IF EXISTS trg_users_sync_fullname ON public.users;
CREATE TRIGGER trg_users_sync_fullname
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_full_name();

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Properties, units, leases, rent_payments, documents, etc.: updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='properties') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties';
    EXECUTE 'CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='units') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_units_updated_at ON public.units';
    EXECUTE 'CREATE TRIGGER trg_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='leases') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_leases_updated_at ON public.leases';
    EXECUTE 'CREATE TRIGGER trg_leases_updated_at BEFORE UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';

    -- attach date validation to leases
    EXECUTE 'DROP TRIGGER IF EXISTS trg_leases_validate_dates ON public.leases';
    EXECUTE 'CREATE TRIGGER trg_leases_validate_dates BEFORE INSERT OR UPDATE ON public.leases FOR EACH ROW EXECUTE FUNCTION public.validate_lease_dates()';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rent_payments') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_rent_payments_updated_at ON public.rent_payments';
    EXECUTE 'CREATE TRIGGER trg_rent_payments_updated_at BEFORE UPDATE ON public.rent_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='documents') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents';
    EXECUTE 'CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END
$$;

COMMIT;

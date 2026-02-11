
-- 1. Add listing_code to listings (unique, short code for QR-only access)
ALTER TABLE public.listings ADD COLUMN listing_code text UNIQUE;

-- 2. Function to generate unique 6-char listing codes
CREATE OR REPLACE FUNCTION public.generate_listing_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    done := NOT EXISTS (SELECT 1 FROM public.listings WHERE listing_code = new_code);
  END LOOP;
  NEW.listing_code := new_code;
  RETURN NEW;
END;
$$;

-- 3. Trigger to auto-generate listing_code on insert
CREATE TRIGGER trg_generate_listing_code
BEFORE INSERT ON public.listings
FOR EACH ROW
WHEN (NEW.listing_code IS NULL)
EXECUTE FUNCTION public.generate_listing_code();

-- 4. Backfill existing listings with codes
DO $$
DECLARE
  r RECORD;
  new_code text;
  done bool;
BEGIN
  FOR r IN SELECT id FROM public.listings WHERE listing_code IS NULL LOOP
    done := false;
    WHILE NOT done LOOP
      new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
      done := NOT EXISTS (SELECT 1 FROM public.listings WHERE listing_code = new_code);
    END LOOP;
    UPDATE public.listings SET listing_code = new_code WHERE id = r.id;
  END LOOP;
END;
$$;

-- 5. Make signs.listing_id nullable to support unassigned signs
ALTER TABLE public.signs ALTER COLUMN listing_id DROP NOT NULL;

-- 6. Assignment history table for analytics integrity
CREATE TABLE public.sign_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sign_id uuid NOT NULL REFERENCES public.signs(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  assigned_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.sign_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own assignments"
ON public.sign_assignments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.signs s
  JOIN public.listings l ON l.id = s.listing_id OR l.id = sign_assignments.listing_id
  WHERE s.id = sign_assignments.sign_id
  AND l.owner_user_id = auth.uid()
));

CREATE POLICY "Admins manage all assignments"
ON public.sign_assignments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Index for fast lookups
CREATE INDEX idx_sign_assignments_sign_id ON public.sign_assignments(sign_id);
CREATE INDEX idx_sign_assignments_listing_id ON public.sign_assignments(listing_id);
CREATE INDEX idx_listings_listing_code ON public.listings(listing_code);

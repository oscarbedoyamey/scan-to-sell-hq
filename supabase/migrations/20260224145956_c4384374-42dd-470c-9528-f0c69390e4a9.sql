
-- Create sign_batches table
CREATE TABLE public.sign_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  language text NOT NULL DEFAULT 'es',
  property_type text NOT NULL DEFAULT 'apartment',
  transaction_type text NOT NULL DEFAULT 'sale',
  has_phone_space boolean NOT NULL DEFAULT false,
  total_count integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE public.sign_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all batches"
  ON public.sign_batches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create unassigned_signs table
CREATE TABLE public.unassigned_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.sign_batches(id) ON DELETE CASCADE,
  activation_token text UNIQUE NOT NULL,
  qr_url text NOT NULL,
  status text NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned', 'sold', 'assigned')),
  customer_id uuid REFERENCES auth.users(id),
  listing_id uuid REFERENCES public.listings(id),
  sold_at timestamptz,
  assigned_at timestamptz,
  png_filename text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unassigned_signs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage all unassigned signs"
  ON public.unassigned_signs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Public can read a single row by token (no auth needed)
CREATE POLICY "Public read by token"
  ON public.unassigned_signs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update rows they own (for activation)
CREATE POLICY "Customers claim unassigned signs"
  ON public.unassigned_signs FOR UPDATE
  TO authenticated
  USING (
    customer_id IS NULL OR customer_id = auth.uid()
  )
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Create index on activation_token for fast lookups
CREATE INDEX idx_unassigned_signs_token ON public.unassigned_signs(activation_token);
CREATE INDEX idx_unassigned_signs_batch ON public.unassigned_signs(batch_id);

-- Create sign-assets storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('sign-assets', 'sign-assets', true);

-- Public read access for sign-assets
CREATE POLICY "Public read sign assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sign-assets');

-- Admins can upload to sign-assets
CREATE POLICY "Admins upload sign assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sign-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete sign assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sign-assets' AND public.has_role(auth.uid(), 'admin'));

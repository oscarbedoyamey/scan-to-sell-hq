
-- Allow owners to insert/update sign_assignments for their own signs
CREATE POLICY "Owners manage own assignments"
ON public.sign_assignments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.listings l
  WHERE l.id = sign_assignments.listing_id
  AND l.owner_user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.listings l
  WHERE l.id = sign_assignments.listing_id
  AND l.owner_user_id = auth.uid()
));

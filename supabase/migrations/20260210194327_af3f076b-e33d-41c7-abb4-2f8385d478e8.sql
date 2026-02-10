
-- Recreate view with security_invoker to use caller's permissions
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public
WITH (security_invoker = on) AS
SELECT
  id, title, description, features,
  property_type, operation_type, condition, status,
  bedrooms, bathrooms, built_area_m2, plot_area_m2, floor,
  elevator, parking, year_built, energy_rating,
  city, region, postal_code, country,
  CASE WHEN hide_exact_address THEN NULL ELSE street END AS street,
  CASE WHEN hide_exact_address THEN NULL ELSE number END AS number,
  CASE WHEN hide_exact_address THEN round(lat::numeric, 2)::float8 ELSE lat END AS lat,
  CASE WHEN hide_exact_address THEN round(lng::numeric, 2)::float8 ELSE lng END AS lng,
  hide_exact_address,
  price_sale, price_rent, currency, show_price,
  cover_image_url, gallery_urls, floorplan_url, video_url, virtual_tour_url,
  agency_name, agency_logo_url, website_url,
  contact_name,
  CASE WHEN show_phone THEN contact_phone ELSE NULL END AS contact_phone,
  CASE WHEN show_email THEN contact_email ELSE NULL END AS contact_email,
  CASE WHEN show_whatsapp THEN contact_whatsapp ELSE NULL END AS contact_whatsapp,
  show_phone, show_email, show_whatsapp,
  lead_form_enabled, base_language, reference_code,
  owner_user_id, created_at, updated_at
FROM public.listings
WHERE status IN ('active', 'paused', 'expired');

-- Re-add the public read policy on listings so the view (with security_invoker) can access rows
CREATE POLICY "Public read active listings"
ON public.listings
FOR SELECT
USING (status IN ('active', 'paused', 'expired'));

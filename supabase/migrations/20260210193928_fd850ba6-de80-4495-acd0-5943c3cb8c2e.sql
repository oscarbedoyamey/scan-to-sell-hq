
-- Create a public view that masks sensitive contact fields based on show_* flags
-- and fuzzes coordinates when hide_exact_address is true
CREATE OR REPLACE VIEW public.listings_public AS
SELECT
  id, title, description, features,
  property_type, operation_type, condition, status,
  bedrooms, bathrooms, built_area_m2, plot_area_m2, floor,
  elevator, parking, year_built, energy_rating,
  street, number, city, region, postal_code, country,
  CASE WHEN hide_exact_address THEN NULL ELSE street END AS public_street,
  CASE WHEN hide_exact_address THEN NULL ELSE number END AS public_number,
  CASE WHEN hide_exact_address THEN round(lat::numeric, 2)::float8 ELSE lat END AS public_lat,
  CASE WHEN hide_exact_address THEN round(lng::numeric, 2)::float8 ELSE lng END AS public_lng,
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

-- Remove the overly permissive public SELECT policy on the base table
DROP POLICY IF EXISTS "Public read active listings" ON public.listings;

-- Re-create a restrictive public policy: only authenticated owners/admins can read
-- (public/anon users must use the view)
-- The owner and admin policies already cover authenticated access, so no new policy needed.

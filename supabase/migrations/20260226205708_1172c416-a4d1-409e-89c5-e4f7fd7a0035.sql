
-- Add 'warehouse' to property_type enum
ALTER TYPE public.property_type ADD VALUE IF NOT EXISTS 'warehouse';

-- Add 'renovated' to property_condition enum
ALTER TYPE public.property_condition ADD VALUE IF NOT EXISTS 'renovated';

-- Add new columns to listings table
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS rental_type text,
  ADD COLUMN IF NOT EXISTS availability_date date,
  ADD COLUMN IF NOT EXISTS furnished text,
  ADD COLUMN IF NOT EXISTS expenses_included text,
  ADD COLUMN IF NOT EXISTS orientation text,
  ADD COLUMN IF NOT EXISTS terrace boolean,
  ADD COLUMN IF NOT EXISTS parking_type text,
  ADD COLUMN IF NOT EXISTS pool boolean,
  ADD COLUMN IF NOT EXISTS land_type text,
  ADD COLUMN IF NOT EXISTS buildability text,
  ADD COLUMN IF NOT EXISTS permitted_use text,
  ADD COLUMN IF NOT EXISTS road_access boolean,
  ADD COLUMN IF NOT EXISTS utilities text[],
  ADD COLUMN IF NOT EXISTS garage_type text,
  ADD COLUMN IF NOT EXISTS garage_location text,
  ADD COLUMN IF NOT EXISTS garage_access text,
  ADD COLUMN IF NOT EXISTS large_car text,
  ADD COLUMN IF NOT EXISTS ev_charging text,
  ADD COLUMN IF NOT EXISTS num_offices integer,
  ADD COLUMN IF NOT EXISTS air_conditioning text,
  ADD COLUMN IF NOT EXISTS street_level boolean,
  ADD COLUMN IF NOT EXISTS smoke_outlet text,
  ADD COLUMN IF NOT EXISTS facade_meters numeric,
  ADD COLUMN IF NOT EXISTS has_transfer boolean,
  ADD COLUMN IF NOT EXISTS transfer_amount numeric,
  ADD COLUMN IF NOT EXISTS warehouse_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS yard_area_m2 numeric,
  ADD COLUMN IF NOT EXISTS free_height_m text,
  ADD COLUMN IF NOT EXISTS trailer_access text,
  ADD COLUMN IF NOT EXISTS electrical_power_kw numeric;


-- 1. ENUM TYPES
create type public.app_role as enum ('admin', 'customer');
create type public.listing_status as enum ('draft', 'active', 'paused', 'expired');
create type public.operation_type as enum ('sale', 'rent');
create type public.property_type as enum ('apartment', 'house', 'villa', 'land', 'commercial', 'office', 'garage', 'other');
create type public.property_condition as enum ('new', 'good', 'needs_renovation');
create type public.purchase_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.sign_size as enum ('A4', 'A3');
create type public.sign_orientation as enum ('portrait', 'landscape');

-- 2. TABLES

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  locale text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

create table public.packages (
  id text primary key,
  duration_months int not null,
  price_eur int not null,
  stripe_price_id text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.packages enable row level security;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade not null,
  status listing_status default 'draft',
  base_language text default 'es',
  operation_type operation_type,
  property_type property_type,
  title text,
  reference_code text,
  price_sale numeric,
  price_rent numeric,
  currency text default 'EUR',
  show_price boolean default true,
  country text,
  region text,
  city text,
  postal_code text,
  street text,
  number text,
  hide_exact_address boolean default false,
  lat double precision,
  lng double precision,
  bedrooms int,
  bathrooms int,
  built_area_m2 numeric,
  plot_area_m2 numeric,
  floor text,
  elevator boolean default false,
  parking boolean default false,
  year_built int,
  condition property_condition,
  energy_rating text,
  features jsonb default '[]'::jsonb,
  description text,
  cover_image_url text,
  gallery_urls jsonb default '[]'::jsonb,
  video_url text,
  virtual_tour_url text,
  floorplan_url text,
  contact_name text,
  contact_phone text,
  show_phone boolean default true,
  contact_email text,
  show_email boolean default true,
  contact_whatsapp text,
  show_whatsapp boolean default false,
  agency_name text,
  agency_logo_url text,
  website_url text,
  lead_form_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.listings enable row level security;
create index idx_listings_owner on public.listings(owner_user_id);
create index idx_listings_status on public.listings(status);

create table public.listing_translations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  language text not null,
  title text,
  description text,
  features jsonb,
  created_at timestamptz default now(),
  unique (listing_id, language)
);
alter table public.listing_translations enable row level security;

create table public.signs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  sign_code text unique not null,
  template_id text default 'clean',
  language text default 'es',
  size sign_size default 'A4',
  orientation sign_orientation default 'portrait',
  show_sale_rent_badge boolean default true,
  show_price boolean default true,
  show_phone boolean default true,
  show_email boolean default false,
  show_whatsapp boolean default false,
  show_icons jsonb default '{"bed":true,"bath":true,"m2":true,"parking":false,"pool":false}'::jsonb,
  headline_text text,
  public_url text,
  qr_image_path text,
  sign_pdf_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.signs enable row level security;
create unique index idx_signs_code on public.signs(sign_code);
create index idx_signs_listing on public.signs(listing_id);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade,
  package_id text references public.packages(id),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_eur int,
  status purchase_status default 'pending',
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz default now()
);
alter table public.purchases enable row level security;
create index idx_purchases_user on public.purchases(user_id);
create index idx_purchases_listing on public.purchases(listing_id);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  sign_id uuid references public.signs(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  occurred_at timestamptz default now(),
  ip_hash text,
  user_agent text,
  referrer text,
  country text,
  city text,
  device text
);
alter table public.scans enable row level security;
create index idx_scans_listing on public.scans(listing_id);
create index idx_scans_sign on public.scans(sign_id);
create index idx_scans_occurred on public.scans(occurred_at);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  sign_id uuid references public.signs(id) on delete set null,
  name text,
  email text,
  phone text,
  message text,
  consent boolean default false,
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create index idx_leads_listing on public.leads(listing_id);

create table public.templates (
  id text primary key,
  name text not null,
  kind text default 'sign',
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.templates enable row level security;

-- 3. HELPER FUNCTION: has_role (SECURITY DEFINER)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 4. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, locale)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'locale', 'en'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. RLS POLICIES

-- user_roles
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- profiles
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins read all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- packages
create policy "Anyone can read active packages" on public.packages for select using (active = true);

-- listings
create policy "Owners manage own listings" on public.listings for all to authenticated using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy "Admins manage all listings" on public.listings for all to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Public read active listings" on public.listings for select using (status in ('active', 'paused', 'expired'));

-- listing_translations
create policy "Owners manage own translations" on public.listing_translations for all to authenticated
  using (exists (select 1 from public.listings where id = listing_translations.listing_id and owner_user_id = auth.uid()));
create policy "Public read translations" on public.listing_translations for select
  using (exists (select 1 from public.listings where id = listing_translations.listing_id and status in ('active', 'paused', 'expired')));

-- signs
create policy "Owners manage own signs" on public.signs for all to authenticated
  using (exists (select 1 from public.listings where id = signs.listing_id and owner_user_id = auth.uid()));
create policy "Admins manage all signs" on public.signs for all to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Public read signs" on public.signs for select
  using (exists (select 1 from public.listings where id = signs.listing_id and status in ('active', 'paused', 'expired')));

-- purchases
create policy "Users read own purchases" on public.purchases for select to authenticated using (user_id = auth.uid());
create policy "Users insert own purchases" on public.purchases for insert to authenticated with check (user_id = auth.uid());
create policy "Admins manage all purchases" on public.purchases for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- scans
create policy "Anyone can insert scans" on public.scans for insert with check (true);
create policy "Owners read own scans" on public.scans for select to authenticated
  using (exists (select 1 from public.listings where id = scans.listing_id and owner_user_id = auth.uid()));
create policy "Admins read all scans" on public.scans for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- leads
create policy "Anyone can submit leads" on public.leads for insert with check (true);
create policy "Owners read own leads" on public.leads for select to authenticated
  using (exists (select 1 from public.listings where id = leads.listing_id and owner_user_id = auth.uid()));
create policy "Admins read all leads" on public.leads for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- templates
create policy "Anyone can read templates" on public.templates for select using (true);
create policy "Admins manage templates" on public.templates for all to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 6. STORAGE BUCKETS
insert into storage.buckets (id, name, public) values
  ('listing-media', 'listing-media', true),
  ('generated-assets', 'generated-assets', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "Auth upload listing media" on storage.objects for insert to authenticated with check (bucket_id = 'listing-media');
create policy "Auth update own listing media" on storage.objects for update to authenticated using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Public read listing media" on storage.objects for select using (bucket_id = 'listing-media');
create policy "Public read generated assets" on storage.objects for select using (bucket_id = 'generated-assets');
create policy "Insert generated assets" on storage.objects for insert with check (bucket_id = 'generated-assets');
create policy "Public read brand assets" on storage.objects for select using (bucket_id = 'brand-assets');

-- 7. SEED DATA
insert into public.packages (id, duration_months, price_eur, active) values
  ('plan_3m', 3, 49, true),
  ('plan_6m', 6, 64, true),
  ('plan_12m', 12, 94, true)
on conflict (id) do nothing;

insert into public.templates (id, name, kind, config) values
  ('clean', 'Clean', 'sign', '{"style":"minimal","showLogo":true}'::jsonb),
  ('photo_qr', 'Photo + QR', 'sign', '{"style":"photo","showLogo":true,"showCoverImage":true}'::jsonb)
on conflict (id) do nothing;

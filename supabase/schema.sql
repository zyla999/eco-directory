-- ============================================================
-- Eco Directory: Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- 1. Stores table (flattened location)
create table if not exists stores (
  id text primary key,
  name text not null,
  description text,
  short_description text,
  categories text[] not null default '{}',
  tags text[] default '{}',
  type text not null default 'brick-and-mortar',
  logo text,
  logo_alt text,
  image_src text,
  image_alt text,
  image_credit text,
  website text,
  email text,
  phone text,
  instagram text,
  facebook text,
  twitter text,
  tiktok text,
  address text,
  city text not null default '',
  state text not null default '',
  country text not null default 'USA',
  region text,
  postal_code text,
  lat double precision,
  lng double precision,
  featured boolean default false,
  sponsored boolean default false,
  sponsor_id text,
  priority integer default 0,
  ships_to text[] default '{}',
  service_area text[] default '{}',
  hours text,
  price_level integer,
  features text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  source text,
  status text not null default 'active',
  review_notes text
);

-- 2. Categories table
create table if not exists categories (
  id text primary key,
  name text not null,
  description text not null default '',
  icon text not null default ''
);

-- 3. Sponsors table
create table if not exists sponsors (
  id text primary key,
  name text not null,
  description text not null default '',
  logo text,
  website text,
  cta text,
  placement text[] not null default '{}',
  target_categories text[] default '{}',
  target_states text[] default '{}',
  start_date date,
  end_date date,
  is_active boolean default true
);

-- ============================================================
-- Indexes
-- ============================================================

-- GIN indexes on array columns for @> (contains) queries
create index if not exists idx_stores_categories on stores using gin (categories);
create index if not exists idx_stores_tags on stores using gin (tags);
create index if not exists idx_stores_features on stores using gin (features);
create index if not exists idx_sponsors_placement on sponsors using gin (placement);
create index if not exists idx_sponsors_target_categories on sponsors using gin (target_categories);

-- B-tree indexes for common filters
create index if not exists idx_stores_status on stores (status);
create index if not exists idx_stores_state on stores (state);
create index if not exists idx_stores_city on stores (city);
create index if not exists idx_stores_country on stores (country);
create index if not exists idx_stores_featured on stores (featured) where featured = true;

-- Full-text search index
create index if not exists idx_stores_search on stores
  using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, '')));

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stores_updated_at
  before update on stores
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table stores enable row level security;
alter table categories enable row level security;
alter table sponsors enable row level security;

-- Public read access for active stores
create policy "Public can read active stores"
  on stores for select
  using (status = 'active');

-- Public can insert stores with needs-review status
create policy "Public can submit stores"
  on stores for insert
  with check (status = 'needs-review');

-- Authenticated users get full access
create policy "Authenticated full access to stores"
  on stores for all
  to authenticated
  using (true)
  with check (true);

-- Categories: public read, authenticated full access
create policy "Public can read categories"
  on categories for select
  using (true);

create policy "Authenticated full access to categories"
  on categories for all
  to authenticated
  using (true)
  with check (true);

-- Sponsors: public read active, authenticated full access
create policy "Public can read active sponsors"
  on sponsors for select
  using (is_active = true);

create policy "Authenticated full access to sponsors"
  on sponsors for all
  to authenticated
  using (true)
  with check (true);

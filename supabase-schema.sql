-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  check_in date not null,
  check_out date not null,
  adults integer not null,
  children integer not null default 0,
  bbq boolean not null default false,
  foraging boolean not null default false,
  breakfast boolean not null default false,
  name text not null,
  phone text not null,
  email text,
  requests text,
  cabin_subtotal numeric not null,
  bbq_cost numeric not null default 0,
  foraging_cost numeric not null default 0,
  breakfast_cost numeric not null default 0,
  total numeric not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on bookings (created_at desc);

-- The site talks to Supabase using the service_role key from server-side API
-- routes only (never exposed to the browser), so Row Level Security can stay
-- enabled with no public policies — the service_role key bypasses RLS.
alter table bookings enable row level security;

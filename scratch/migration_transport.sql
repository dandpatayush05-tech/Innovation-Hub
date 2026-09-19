-- Migration for Chunk 24: Unified Transport Search

create table if not exists transport_modes (
  id uuid primary key default uuid_generate_v4(),
  mode text not null check (mode in ('flight', 'bus', 'auto')),
  base_fare numeric not null,
  rate_per_km numeric not null,
  comfort_score integer not null check (comfort_score >= 1 and comfort_score <= 5),
  min_distance_km numeric not null,
  max_distance_km numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table transport_modes enable row level security;

-- Seed Data
insert into transport_modes (mode, base_fare, rate_per_km, comfort_score, min_distance_km, max_distance_km)
values
  ('flight', 50, 0.15, 4, 150, 10000),
  ('bus', 5, 0.05, 3, 10, 800),
  ('auto', 10, 0.50, 4, 0, 150)
on conflict do nothing;

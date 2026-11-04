create extension if not exists postgis with schema extensions;

create type public.user_role as enum ('user', 'admin');
create type public.gym_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location extensions.geography(point, 4326),
  phone text not null default '',
  website text not null default '',
  instagram text not null default '',
  status public.gym_status not null default 'draft',
  recommended boolean not null default false,
  description jsonb not null default '{"bs":"","en":""}'::jsonb,
  editor_note jsonb not null default '{"bs":"","en":""}'::jsonb,
  best_for text[] not null default '{}',
  opening_hours jsonb not null default '{}'::jsonb,
  pros jsonb not null default '{"bs":[],"en":[]}'::jsonb,
  cons jsonb not null default '{"bs":[],"en":[]}'::jsonb,
  last_verified date,
  source text not null default 'manual',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_photos (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms (id) on delete cascade,
  storage_path text not null,
  alt_text jsonb not null default '{"bs":"","en":""}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (gym_id, storage_path)
);

create table public.amenities (
  id text primary key,
  label jsonb not null default '{"bs":"","en":""}'::jsonb,
  icon text not null default ''
);

create table public.gym_amenities (
  gym_id uuid not null references public.gyms (id) on delete cascade,
  amenity_id text not null references public.amenities (id) on delete restrict,
  primary key (gym_id, amenity_id)
);

create table public.gym_prices (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'BAM' check (currency = 'BAM'),
  plan_type text not null,
  friendly_label jsonb not null default '{"bs":"","en":""}'::jsonb,
  source text not null,
  last_verified date,
  submitted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  gym_id uuid not null references public.gyms (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, gym_id)
);

create index gyms_location_gix on public.gyms using gist (location);
create index gyms_status_idx on public.gyms (status);
create index gym_prices_gym_id_idx on public.gym_prices (gym_id);
create index gym_photos_gym_order_idx on public.gym_photos (gym_id, sort_order);
create index favorites_gym_id_idx on public.favorites (gym_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.sync_gym_location()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.location = extensions.st_setsrid(
    extensions.st_makepoint(new.longitude, new.latitude),
    4326
  )::extensions.geography;
  return new;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), '')
  );
  return new;
end;
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create trigger gyms_sync_location
before insert or update of latitude, longitude on public.gyms
for each row execute function public.sync_gym_location();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger gyms_set_updated_at
before update on public.gyms
for each row execute function public.set_updated_at();

create trigger gym_prices_set_updated_at
before update on public.gym_prices
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_photos enable row level security;
alter table public.amenities enable row level security;
alter table public.gym_amenities enable row level security;
alter table public.gym_prices enable row level security;
alter table public.favorites enable row level security;

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

create policy "Anyone can read published gyms"
on public.gyms for select to anon, authenticated
using (status = 'published' or (select public.is_admin()));

create policy "Admins can create gyms"
on public.gyms for insert to authenticated
with check ((select public.is_admin()));

create policy "Admins can update gyms"
on public.gyms for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete gyms"
on public.gyms for delete to authenticated
using ((select public.is_admin()));

create policy "Anyone can read photos for published gyms"
on public.gym_photos for select to anon, authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.gyms
    where gyms.id = gym_photos.gym_id and gyms.status = 'published'
  )
);

create policy "Admins can manage gym photos"
on public.gym_photos for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read amenities"
on public.amenities for select to anon, authenticated
using (true);

create policy "Admins can manage amenities"
on public.amenities for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read amenities for published gyms"
on public.gym_amenities for select to anon, authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.gyms
    where gyms.id = gym_amenities.gym_id and gyms.status = 'published'
  )
);

create policy "Admins can manage gym amenities"
on public.gym_amenities for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can read prices for published gyms"
on public.gym_prices for select to anon, authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.gyms
    where gyms.id = gym_prices.gym_id and gyms.status = 'published'
  )
);

create policy "Admins can manage gym prices"
on public.gym_prices for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Users can read their own favorites"
on public.favorites for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

create policy "Users can save their own favorites"
on public.favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
on public.favorites for delete to authenticated
using ((select auth.uid()) = user_id or (select public.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.gyms, public.gym_photos, public.amenities,
  public.gym_amenities, public.gym_prices to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant insert, update, delete on public.gyms, public.gym_photos,
  public.amenities, public.gym_amenities, public.gym_prices to authenticated;
grant usage on type public.user_role, public.gym_status to anon, authenticated;

insert into public.amenities (id, label, icon) values
  ('weights', '{"bs":"Težine","en":"Weights"}', '🏋️'),
  ('cardio', '{"bs":"Kardio","en":"Cardio"}', '🥇'),
  ('lockers', '{"bs":"Ormari","en":"Lockers"}', '🔒'),
  ('group-classes', '{"bs":"Grupni treninzi","en":"Group classes"}', '🎯'),
  ('sauna', '{"bs":"Sauna","en":"Sauna"}', '♨️'),
  ('parking', '{"bs":"Parking","en":"Parking"}', '🚗'),
  ('personal-training', '{"bs":"Personalni trening","en":"Personal training"}', '👟')
on conflict (id) do nothing;

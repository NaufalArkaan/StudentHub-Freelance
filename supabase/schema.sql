-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Custom Enum for User Roles
create type user_role as enum ('admin', 'freelancer', 'client');
create type order_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type report_status as enum ('pending', 'resolved', 'dismissed');

-- 1. Users Table (Linked to auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role user_role not null default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- 2. Profiles Table (Contains detailed information based on roles)
create table public.profiles (
  id uuid references public.users(id) on delete cascade primary key,
  full_name text not null,
  nim text unique,
  program_study text,
  skills text[], -- Tag array of expertise for freelancer
  github_url text,
  linkedin_url text,
  portfolio_url text, -- File uploaded to Supabase storage
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 3. Categories Table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- 4. Services Table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  freelancer_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  title text not null,
  description text not null,
  price numeric(12, 2) not null,
  image_url text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on services
alter table public.services enable row level security;

-- 5. Portfolios Table
create table public.portfolios (
  id uuid default gen_random_uuid() primary key,
  freelancer_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  file_url text not null,
  is_verified boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on portfolios
alter table public.portfolios enable row level security;

-- 6. Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.users(id) on delete restrict not null,
  service_id uuid references public.services(id) on delete restrict not null,
  price numeric(12, 2) not null,
  status order_status default 'pending' not null,
  requirements text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on orders
alter table public.orders enable row level security;

-- 7. Reviews Table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null unique,
  client_id uuid references public.users(id) on delete cascade not null,
  freelancer_id uuid references public.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reviews
alter table public.reviews enable row level security;

-- 8. Reports Table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.users(id) on delete cascade not null,
  reported_user_id uuid references public.users(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  reason text not null,
  description text,
  status report_status default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on reports
alter table public.reports enable row level security;

-- Setup Row Level Security Policies (Allow select for public, modify for owners)

-- Users policies
create policy "Allow select users for authenticated users" on public.users
  for select to authenticated using (true);

create policy "Allow select users for public" on public.users
  for select to anon using (true);

create policy "Allow insert users for service role" on public.users
  for insert with check (true);

-- Profiles policies
create policy "Allow public read on profiles" on public.profiles
  for select using (true);

create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Categories policies
create policy "Allow public read on categories" on public.categories
  for select using (true);

-- Services policies
create policy "Allow public read on active services" on public.services
  for select using (is_active = true);

create policy "Allow freelancers to manage own services" on public.services
  for all using (auth.uid() = freelancer_id);

-- Portfolios policies
create policy "Allow public read on portfolios" on public.portfolios
  for select using (true);

create policy "Allow freelancers to manage own portfolios" on public.portfolios
  for all using (auth.uid() = freelancer_id);

-- Orders policies
create policy "Allow clients to view own orders" on public.orders
  for select using (auth.uid() = client_id);

create policy "Allow freelancers to view assigned orders" on public.orders
  for select using (exists (
    select 1 from public.services s 
    where s.id = service_id and s.freelancer_id = auth.uid()
  ));

create policy "Allow clients to create orders" on public.orders
  for insert with check (auth.uid() = client_id);

create policy "Allow clients or freelancers to update order status" on public.orders
  for update using (
    auth.uid() = client_id or 
    exists (
      select 1 from public.services s 
      where s.id = service_id and s.freelancer_id = auth.uid()
    )
  );

-- Reviews policies
create policy "Allow public read on reviews" on public.reviews
  for select using (true);

create policy "Allow clients to create reviews on their orders" on public.reviews
  for insert with check (auth.uid() = client_id);

-- Reports policies
create policy "Allow authenticated users to create reports" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "Allow admins to view reports" on public.reports
  for select using (exists (
    select 1 from public.users u 
    where u.id = auth.uid() and u.role = 'admin'
  ));

-- AUTOMATIC SYNC TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role)
  );

  insert into public.profiles (id, full_name, nim, program_study, skills, github_url, linkedin_url, portfolio_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'nim',
    new.raw_user_meta_data->>'program_study',
    null,
    new.raw_user_meta_data->>'github_url',
    new.raw_user_meta_data->>'linkedin_url',
    new.raw_user_meta_data->>'portfolio_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if it already exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

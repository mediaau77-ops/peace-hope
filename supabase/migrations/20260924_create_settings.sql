-- Migration: Create settings table with Row Level Security (RLS)
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.settings enable row level security;

create policy "settings_public_read"
  on public.settings for select
  to anon, authenticated
  using (key in ('public', 'theme', 'languages', 'contact'));

create policy "settings_admin_write"
  on public.settings for all
  to authenticated
  using (
    exists (
      select 1 from public.users_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('super_admin', 'admin')
    )
  );

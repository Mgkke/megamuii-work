create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  installation text[] default '{}',
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version text not null,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can read projects" on public.projects for select using (true);
create policy "Public can read project files" on public.project_files for select using (true);
create policy "Admin can read own admin row" on public.admin_users for select using (auth.uid() = user_id);

create policy "Admin can insert projects" on public.projects for insert with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can update projects" on public.projects for update using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can delete projects" on public.projects for delete using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admin can insert files" on public.project_files for insert with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can update files" on public.project_files for update using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can delete files" on public.project_files for delete using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('downloads', 'downloads', true) on conflict (id) do nothing;

create policy "Public can view covers" on storage.objects for select using (bucket_id = 'covers');
create policy "Public can view downloads" on storage.objects for select using (bucket_id = 'downloads');
create policy "Admin can upload covers" on storage.objects for insert with check (bucket_id = 'covers' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can upload downloads" on storage.objects for insert with check (bucket_id = 'downloads' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can update storage" on storage.objects for update using (bucket_id in ('covers','downloads') and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admin can delete storage" on storage.objects for delete using (bucket_id in ('covers','downloads') and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

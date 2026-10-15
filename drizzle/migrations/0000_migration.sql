create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  description text,
  type text not null default 'Outro',
  status text not null default 'Em andamento',
  value numeric(12,2) not null default 0,
  deadline date,
  links text,
  notes text,
  created_at timestamptz not null default now()
);
create table public.project_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create table public.pricing_settings (
  user_id uuid primary key default auth.uid(),
  hourly_rate numeric(12,2) not null default 100,
  margin numeric(6,2) not null default 20,
  complexity numeric(4,2) not null default 1,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients, public.projects, public.project_steps, public.pricing_settings to authenticated;
grant all on public.clients, public.projects, public.project_steps, public.pricing_settings to service_role;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_steps enable row level security;
alter table public.pricing_settings enable row level security;
create policy "own clients" on public.clients for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own projects" on public.projects for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own steps" on public.project_steps for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own settings" on public.pricing_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create index on public.projects(user_id, deadline);
create index on public.project_steps(project_id);
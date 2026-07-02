create table if not exists sessions (
  session_id text primary key,
  name text,
  gender text,
  age text,
  style text,
  occasion text,
  goal text,
  stage text default 'questions',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id text references sessions(session_id) on delete cascade,
  sender text not null,
  message text not null,
  message_type text default 'text',
  image_url text,
  created_at timestamptz default now()
);

create table if not exists outfit_templates (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  occasion text,
  gender text,
  style_tag text,
  image_url text not null,
  base_confidence int default 75,
  base_authority int default 75,
  base_trust int default 75,
  base_approachability int default 75,
  base_style_fit int default 75,
  created_at timestamptz default now()
);

create table if not exists admin_flags (
  session_id text primary key references sessions(session_id) on delete cascade,
  needs_image boolean default false,
  suggested_template_id uuid references outfit_templates(id),
  suggestion_reason text,
  resolved boolean default false,
  flagged_at timestamptz default now()
);

alter table sessions enable row level security;
alter table messages enable row level security;
alter table outfit_templates enable row level security;
alter table admin_flags enable row level security;

create policy "public read templates" on outfit_templates for select using (true);
create policy "public read own session" on sessions for select using (true);
create policy "public insert own session" on sessions for insert with check (true);
create policy "public update own session" on sessions for update using (true);
create policy "public read messages" on messages for select using (true);
create policy "public insert messages" on messages for insert with check (true);
create policy "public read flags" on admin_flags for select using (true);
create policy "public write flags" on admin_flags for all using (true);

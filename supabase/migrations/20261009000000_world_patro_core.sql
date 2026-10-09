-- World Patro production core
-- Explicit grants are included because new Supabase projects no longer expose new public tables automatically.
create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en',
  timezone text not null default 'Asia/Kathmandu',
  home_lat double precision,
  home_lon double precision,
  role text not null default 'member' check (role in ('member','researcher','editor','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  birth_time time,
  timezone text not null,
  lat double precision not null check (lat between -90 and 90),
  lon double precision not null check (lon between -180 and 180),
  elevation_m double precision not null default 0,
  place_name text,
  calculation_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists birth_profiles_user_idx on public.birth_profiles(user_id);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('kundli','panchang','muhurat','compatibility','wbe','country','research')),
  title text not null,
  request_context jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  calculation_version jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists saved_reports_user_created_idx on public.saved_reports(user_id,created_at desc);

create table if not exists public.calendar_profiles (
  slug text primary key,
  family text not null,
  name text not null,
  jurisdiction text,
  nature text not null,
  day_boundary text not null,
  method text not null,
  status text not null default 'active',
  version text not null default '1',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.source_registry (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tier text not null check (tier in ('A','B','C','D')),
  kind text not null,
  publisher text,
  url text,
  license text,
  jurisdiction text,
  update_cadence text,
  status text not null default 'active' check (status in ('active','degraded','retired')),
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.authority_releases (
  id uuid primary key default gen_random_uuid(),
  calendar_profile_slug text references public.calendar_profiles(slug) on delete set null,
  source_id uuid references public.source_registry(id) on delete set null,
  jurisdiction text not null,
  release_type text not null,
  valid_from date,
  valid_to date,
  payload jsonb not null,
  content_hash text,
  published_at timestamptz,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists authority_releases_profile_idx on public.authority_releases(calendar_profile_slug,published_at desc);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  canonical_name text not null,
  country_code text,
  aliases jsonb not null default '[]'::jsonb,
  valid_from date,
  valid_to date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists entities_type_country_idx on public.entities(entity_type,country_code);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  title text not null,
  summary text,
  starts_at timestamptz,
  ends_at timestamptz,
  country_code text,
  location jsonb,
  confidence text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_type_time_idx on public.events(event_type,starts_at desc);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  subject_entity_id uuid references public.entities(id) on delete set null,
  predicate text not null,
  object_text text not null,
  claim_type text not null check (claim_type in ('fact','reported_claim','interpretation','scenario','forecast','wbe_symbolism')),
  verification_state text not null default 'unverified' check (verification_state in ('verified','supported','disputed','unverified','outdated','retracted')),
  valid_from timestamptz,
  valid_to timestamptz,
  confidence numeric(4,3) check (confidence is null or (confidence between 0 and 1)),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  source_id uuid not null references public.source_registry(id) on delete restrict,
  source_locator text,
  retrieved_at timestamptz not null default now(),
  supports boolean not null default true,
  notes text
);
create index if not exists evidence_claim_idx on public.evidence(claim_id);
create index if not exists evidence_source_idx on public.evidence(source_id);

create table if not exists public.religious_observances (
  id uuid primary key default gen_random_uuid(),
  tradition text not null,
  denomination text,
  name text not null,
  jurisdiction text,
  calendar_profile_slug text references public.calendar_profiles(slug) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  method text not null,
  status text not null check (status in ('calculated','official','observational','community_rule','historical')),
  source_id uuid references public.source_registry(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.research_notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists research_notebooks_user_idx on public.research_notebooks(user_id);

create table if not exists public.research_items (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid not null references public.research_notebooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  ref_id text,
  note text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists research_items_notebook_idx on public.research_items(notebook_id,created_at desc);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists watchlists_user_idx on public.watchlists(user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  severity text not null default 'notice' check (severity in ('info','notice','important','high','critical')),
  title text not null,
  body text,
  provenance jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

create table if not exists public.workflow_orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','review','approved','assigned','active','verify','closed','archived','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  jurisdiction text,
  related_entity_id uuid references public.entities(id) on delete set null,
  due_at timestamptz,
  requires_human_confirmation boolean not null default true,
  approval_state jsonb not null default '{}'::jsonb,
  evidence_bundle jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workflow_orders_owner_status_idx on public.workflow_orders(owner_user_id,status,created_at desc);

create table if not exists public.workflow_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.workflow_orders(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists workflow_events_order_idx on public.workflow_events(order_id,created_at);

create table if not exists public.wbe_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subject_type text not null,
  subject_ref text,
  scores jsonb not null,
  interpretation jsonb not null default '{}'::jsonb,
  evidence_model text,
  created_at timestamptz not null default now()
);
create index if not exists wbe_assessments_user_idx on public.wbe_assessments(user_id,created_at desc);

create table if not exists public.astrologers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  bio text,
  languages text[] not null default '{}',
  specialities text[] not null default '{}',
  experience_years int not null default 0 check (experience_years >= 0),
  fee_npr int,
  rating numeric(3,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  astrologer_id uuid references public.astrologers(id) on delete set null,
  mode text not null check (mode in ('chat','call','video','in_person')),
  topic text not null,
  scheduled_at timestamptz,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  consent_recording boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists consultations_user_idx on public.consultations(user_id,created_at desc);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_ne text,
  excerpt text,
  content text not null,
  category text not null,
  tags text[] not null default '{}',
  author text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auth profile creation is kept in a non-exposed schema.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id,display_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(coalesce(new.email,''),'@',1)))
  on conflict(id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

-- RLS on every public table.
alter table public.profiles enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.saved_reports enable row level security;
alter table public.calendar_profiles enable row level security;
alter table public.source_registry enable row level security;
alter table public.authority_releases enable row level security;
alter table public.entities enable row level security;
alter table public.events enable row level security;
alter table public.claims enable row level security;
alter table public.evidence enable row level security;
alter table public.religious_observances enable row level security;
alter table public.research_notebooks enable row level security;
alter table public.research_items enable row level security;
alter table public.watchlists enable row level security;
alter table public.notifications enable row level security;
alter table public.workflow_orders enable row level security;
alter table public.workflow_events enable row level security;
alter table public.wbe_assessments enable row level security;
alter table public.astrologers enable row level security;
alter table public.consultations enable row level security;
alter table public.articles enable row level security;

-- Public/reference read policies.
create policy "calendar profiles public read" on public.calendar_profiles for select to anon,authenticated using (status='active');
create policy "sources public read" on public.source_registry for select to anon,authenticated using (status='active');
create policy "authority releases public read" on public.authority_releases for select to anon,authenticated using (true);
create policy "entities public read" on public.entities for select to anon,authenticated using (true);
create policy "events public read" on public.events for select to anon,authenticated using (true);
create policy "claims public read" on public.claims for select to anon,authenticated using (verification_state <> 'retracted');
create policy "evidence public read" on public.evidence for select to anon,authenticated using (true);
create policy "observances public read" on public.religious_observances for select to anon,authenticated using (true);
create policy "astrologers public read" on public.astrologers for select to anon,authenticated using (is_active);
create policy "articles public read" on public.articles for select to anon,authenticated using (is_published);

-- User-owned policies.
create policy "profiles own read" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "profiles own update" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);

create policy "birth profiles own" on public.birth_profiles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "reports own" on public.saved_reports for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "notebooks own" on public.research_notebooks for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "research items own" on public.research_items for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "watchlists own" on public.watchlists for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "notifications own read" on public.notifications for select to authenticated using ((select auth.uid())=user_id);
create policy "notifications own update" on public.notifications for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "workflow orders own" on public.workflow_orders for all to authenticated using ((select auth.uid())=owner_user_id) with check ((select auth.uid())=owner_user_id);
create policy "workflow events via owned order" on public.workflow_events for select to authenticated using (exists(select 1 from public.workflow_orders o where o.id=order_id and o.owner_user_id=(select auth.uid())));
create policy "wbe own or anonymous insert" on public.wbe_assessments for insert to authenticated with check (user_id is null or user_id=(select auth.uid()));
create policy "wbe own read" on public.wbe_assessments for select to authenticated using (user_id=(select auth.uid()));
create policy "consultations own" on public.consultations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Explicit Data API grants (required for current Supabase defaults).
grant select on public.calendar_profiles,public.source_registry,public.authority_releases,public.entities,public.events,public.claims,public.evidence,public.religious_observances,public.astrologers,public.articles to anon,authenticated;
grant select,update on public.profiles,public.notifications to authenticated;
grant select,insert,update,delete on public.birth_profiles,public.saved_reports,public.research_notebooks,public.research_items,public.watchlists,public.workflow_orders,public.wbe_assessments,public.consultations to authenticated;
grant select on public.workflow_events to authenticated;
grant usage,select on sequence public.workflow_events_id_seq to authenticated;

-- Realtime tables used by the notification/workflow UI.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='workflow_orders') then
    alter publication supabase_realtime add table public.workflow_orders;
  end if;
end $$;

-- Seed calendar profiles.
insert into public.calendar_profiles(slug,family,name,jurisdiction,nature,day_boundary,method,version)
values
('vedic-panchang','vedic','Vedic Panchang',null,'astronomical','sunrise/profile','ephemeris + tradition rules','1'),
('gregorian','gregorian','Gregorian',null,'solar arithmetic','midnight','deterministic','1'),
('nepal-bs','vikram-samvat','Bikram Sambat','NP','civil solar','midnight','authority table','1'),
('nepal-sambat','nepal-sambat','Nepal Sambat','NP','lunisolar','regional','authority/research profile','1'),
('islamic-civil','islamic','Islamic Civil',null,'lunar arithmetic','sunset semantics','deterministic','1'),
('chinese','chinese','Chinese Lunisolar','CN','astronomical lunisolar','regional civil day','astronomical/ICU profile','1'),
('hebrew','hebrew','Hebrew',null,'arithmetic lunisolar','sunset','deterministic','1'),
('persian','persian','Persian Solar Hijri','IR','solar','civil/local','profile-specific','1'),
('buddhist-th','buddhist','Thai Buddhist Era','TH','solar era','midnight','gregorian-linked','1')
on conflict(slug) do update set version=excluded.version,updated_at=now();

insert into public.source_registry(slug,name,tier,kind,publisher,url,license,status,last_verified_at)
values
('iana-tzdb','IANA Time Zone Database','A','official_dataset','IANA','https://www.iana.org/time-zones','public data','active',now()),
('world-bank','World Bank Open Data','A','official_api','World Bank','https://api.worldbank.org/','World Bank terms','active',now()),
('astronomy-engine','Astronomy Engine','B','calculation_library','Don Cross','https://github.com/cosinekitty/astronomy','MIT','active',now())
on conflict(slug) do update set status='active',last_verified_at=now();

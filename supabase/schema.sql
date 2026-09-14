-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- This app is single-user and password-gated at the app layer, so Row Level
-- Security is left off and all queries run server-side with the service role key.

create extension if not exists "pgcrypto";

-- ROUTINES ------------------------------------------------------------
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  log_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (routine_id, log_date)
);

create index if not exists routine_logs_date_idx on routine_logs(log_date);

-- TODOS -----------------------------------------------------------------
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  deadline date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- JOURNAL -----------------------------------------------------------------
create table if not exists journal_settings (
  id integer primary key default 1,
  morning_time time not null default '08:00',
  evening_time time not null default '21:00',
  constraint single_row check (id = 1)
);
insert into journal_settings (id) values (1) on conflict (id) do nothing;

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  session text not null check (session in ('morning', 'evening')),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_date, session)
);

-- TIME TRACKER --------------------------------------------------------
create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  entry_date date not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists time_entries_date_idx on time_entries(entry_date);

-- THOUGHTS --------------------------------------------------------------
create table if not exists thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

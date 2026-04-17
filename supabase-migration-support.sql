-- Migration: support_messages table
-- Run this in Supabase SQL editor.

create table if not exists public.support_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  subject      text not null,
  email        text not null,
  message      text not null,
  handled      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists support_messages_created_at_idx
  on public.support_messages(created_at desc);

alter table public.support_messages enable row level security;

-- Only the authenticated user who submitted can read their own messages.
-- Admin access happens via service_role in the dashboard.
drop policy if exists support_messages_insert on public.support_messages;
create policy support_messages_insert
  on public.support_messages for insert
  with check (
    user_id is null or user_id = auth.uid()
  );

drop policy if exists support_messages_select_own on public.support_messages;
create policy support_messages_select_own
  on public.support_messages for select
  using (user_id is not null and user_id = auth.uid());

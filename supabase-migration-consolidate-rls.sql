-- ============================================
-- Optional post-launch migration — consolidate RLS policies
-- ============================================
-- Why: running `supabase-setup.sql` + `supabase-migration-business-logic.sql`
-- both created overlapping policies. Plus all existing policies call
-- auth.uid() directly, forcing per-row re-evaluation. Postgres' planner
-- can optimize the result if we wrap it in `(select auth.uid())`.
--
-- Run in Supabase SQL Editor. Safe to re-run.
-- Semantics match exactly: same read/write permissions as before.
-- ============================================

begin;

-- -------- events --------
drop policy if exists "Everyone can read events" on public.events;
drop policy if exists "Public read events" on public.events;
drop policy if exists events_read_all on public.events;

create policy events_public_read on public.events
  for select to anon, authenticated
  using (true);

-- -------- profiles --------
drop policy if exists profiles_read_all on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Public read profiles" on public.profiles;

create policy profiles_public_read on public.profiles
  for select to anon, authenticated
  using (true);

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id);

-- -------- listings --------
drop policy if exists "Everyone can read listings" on public.listings;
drop policy if exists "Public read listings" on public.listings;
drop policy if exists listings_read_active on public.listings;
drop policy if exists "Sellers can create listings" on public.listings;
drop policy if exists "Users insert own listings" on public.listings;
drop policy if exists listings_insert_own on public.listings;
drop policy if exists "Sellers can update own listings" on public.listings;
drop policy if exists "Users update own listings" on public.listings;
drop policy if exists listings_update_own on public.listings;
drop policy if exists "Sellers can delete own listings" on public.listings;
drop policy if exists "Users delete own listings" on public.listings;
drop policy if exists listings_delete_own on public.listings;

create policy listings_read_active_or_own on public.listings
  for select to anon, authenticated
  using (
    status = 'active' or seller_id = (select auth.uid())
  );

create policy listings_insert_own on public.listings
  for insert to authenticated
  with check ((select auth.uid()) = seller_id);

create policy listings_update_own on public.listings
  for update to authenticated
  using ((select auth.uid()) = seller_id);

create policy listings_delete_own on public.listings
  for delete to authenticated
  using ((select auth.uid()) = seller_id);

-- -------- support_messages --------
drop policy if exists support_messages_insert on public.support_messages;
drop policy if exists support_messages_select_own on public.support_messages;

create policy support_messages_insert on public.support_messages
  for insert to anon, authenticated
  with check (
    user_id is null or user_id = (select auth.uid())
  );

create policy support_messages_select_own on public.support_messages
  for select to authenticated
  using (
    user_id is not null and user_id = (select auth.uid())
  );

commit;

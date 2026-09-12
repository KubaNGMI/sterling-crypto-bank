-- ============================================================================
-- Sterling Crypto Bank — Row Level Security
--
-- Run top to bottom in Supabase -> SQL Editor. Safe to re-run: it drops its
-- own policies first.
--
-- The model, in one line: you can only see and touch your own rows; the single
-- admin account can see everything and is the only one who can move money.
-- ============================================================================


-- STEP 1 =====================================================================
-- Who counts as an admin. Exactly one account, pinned by user id. If that
-- account is ever recreated, this id is the one line to change.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() = '2fec6064-dce3-423a-9ab3-90fd760302dc'::uuid;
$$;


-- STEP 2 =====================================================================
-- Clear policies from any earlier attempt so this file is re-runnable.

do $$
declare r record;
begin
  for r in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('profiles','transactions','bank_accounts','notifications','verifications')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;


-- STEP 3 =====================================================================
-- profiles: read/edit your own, admin sees all. A user must not be able to
-- promote themselves, so the guard trigger freezes the columns that matter.

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Without this, "update your own profile" includes account_status — a user
-- could sign up and verify themselves. Reverts rather than raises, because
-- signup legitimately re-sends these columns with unchanged values.
create or replace function public.guard_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return NEW;
  end if;
  NEW.id             := OLD.id;
  NEW.email          := OLD.email;
  NEW.account_status := OLD.account_status;
  return NEW;
end $$;

drop trigger if exists trg_guard_profile_columns on public.profiles;
create trigger trg_guard_profile_columns
  before update on public.profiles
  for each row execute function public.guard_profile_columns();


-- STEP 4 =====================================================================
-- transactions: the money table. This is where "mint cash from devtools"
-- actually closes.
--
-- A user may file a deposit (pending only — an admin confirms it arrived) or
-- record a buy/sell (the existing check_transaction_funds trigger already
-- verifies they can afford it). They cannot write adjustments, transfers or
-- withdrawals at all, cannot write rows for anyone else, and cannot confirm
-- or delete anything.

alter table public.transactions enable row level security;

create policy "transactions_select" on public.transactions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "transactions_insert" on public.transactions
  for insert to authenticated
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      and source = 'user'
      and (
        (type = 'deposit' and status = 'pending')
        or (type in ('buy','sell') and status = 'completed')
      )
    )
  );

create policy "transactions_update" on public.transactions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "transactions_delete" on public.transactions
  for delete to authenticated
  using (public.is_admin());


-- STEP 5 =====================================================================
-- bank_accounts, notifications, verifications.

alter table public.bank_accounts enable row level security;

create policy "bank_accounts_select" on public.bank_accounts
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Linked accounts always start pending; only an admin marks one verified.
create policy "bank_accounts_insert" on public.bank_accounts
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

create policy "bank_accounts_update" on public.bank_accounts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "bank_accounts_delete" on public.bank_accounts
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());


alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

-- Users insert their own delayed trade notifications; admin sends messages.
create policy "notifications_insert" on public.notifications
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_update" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


alter table public.verifications enable row level security;

create policy "verifications_select" on public.verifications
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "verifications_insert" on public.verifications
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "verifications_update" on public.verifications
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());


-- STEP 6 =====================================================================
-- Existing triggers must keep working once RLS is on. They read and write rows
-- the calling user can't necessarily see, so they need to run as owner.

do $$
begin
  if to_regprocedure('public.check_transaction_funds()') is not null then
    execute 'alter function public.check_transaction_funds() security definer';
    execute 'alter function public.check_transaction_funds() set search_path = public';
  end if;
  if to_regprocedure('public.notify_on_transaction()') is not null then
    execute 'alter function public.notify_on_transaction() security definer';
    execute 'alter function public.notify_on_transaction() set search_path = public';
  end if;
  if to_regprocedure('public.handle_new_user()') is not null then
    execute 'alter function public.handle_new_user() security definer';
    execute 'alter function public.handle_new_user() set search_path = public';
  end if;
end $$;


-- STEP 7 =====================================================================
-- Storage. KYC documents and bank statements both live in kyc-documents under
-- a <user_id>/ folder, so the first path segment is the owner.

update storage.buckets set public = false where id = 'kyc-documents';

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname like 'kyc_%'
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "kyc_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'kyc-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "kyc_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "kyc_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

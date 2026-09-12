-- ===========================================================================
-- Sterling Crypto Bank — make signup survive email confirmation
--
-- Run these in the Supabase SQL editor, one STEP at a time, top to bottom.
-- Each step ends with a check that prints something you can eyeball before
-- moving on. Re-running the whole file is safe.
--
-- WHY THIS EXISTS
-- Signup used to write the profile from the browser, right after signUp().
-- That only works when Supabase hands back a session immediately — i.e. when
-- email confirmation is OFF. Turn confirmation ON and there is no session at
-- that moment, so the write was refused by RLS and every detail the person
-- typed was silently dropped.
--
-- The fix: the browser sends the details as auth metadata, and the database
-- writes the profile itself, in a trigger that needs no session at all.
-- ===========================================================================


-- STEP 1 =====================================================================
-- Look at what you have now. This changes nothing.
--
-- The first result tells you the column types the trigger has to fill; the
-- second shows any trigger already sitting on auth.users. Expect to see one
-- called something like on_auth_user_created — STEP 3 replaces it.

select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles'
 order by ordinal_position;

select t.tgname as trigger_name, p.proname as function_name
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
 where t.tgrelid = 'auth.users'::regclass
   and not t.tgisinternal;


-- STEP 2 =====================================================================
-- Replace the trigger function.
--
-- Two things here are load-bearing:
--
--   security definer  — it runs as the function's owner, not as the person
--                       signing up (who has no session yet). Without this the
--                       insert is refused by RLS, which is the whole bug.
--
--   account_status    — hardcoded to 'unverified'. It is NEVER read from
--                       metadata. raw_user_meta_data is writable by the user
--                       it belongs to, so anyone who could get a value from
--                       there into this column could sign up pre-verified and
--                       walk straight past the deposit and trading gates.
--                       Same reason the guard trigger freezes the column
--                       afterwards. Only display fields come from metadata.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  sof  public.profiles.source_of_funds%type;
begin
  -- Let Postgres perform the cast, so this keeps working whether
  -- source_of_funds is text[] or jsonb.
  if jsonb_typeof(meta->'source_of_funds') = 'array' then
    sof := (jsonb_populate_record(
              null::public.profiles,
              jsonb_build_object('source_of_funds', meta->'source_of_funds')
            )).source_of_funds;
  end if;

  insert into public.profiles (
    id, email, account_status,
    first_name, last_name, gender, phone,
    citizenship, country_of_residence,
    source_of_funds, funds_range
  )
  values (
    new.id,
    new.email,
    'unverified',
    nullif(meta->>'first_name', ''),
    nullif(meta->>'last_name', ''),
    nullif(meta->>'gender', ''),
    nullif(meta->>'phone', ''),
    nullif(meta->>'citizenship', ''),
    nullif(meta->>'country_of_residence', ''),
    sof,
    nullif(meta->>'funds_range', '')
  )
  on conflict (id) do nothing;

  return new;

exception when others then
  -- An account with no profile row is the failure mode that hurts most, so if
  -- anything above goes wrong we still seed the minimum and let signup finish.
  -- The warning lands in the Postgres logs.
  raise warning 'handle_new_user: could not write full profile for %: %',
    new.id, sqlerrm;

  insert into public.profiles (id, email, account_status)
  values (new.id, new.email, 'unverified')
  on conflict (id) do nothing;

  return new;
end
$fn$;


-- STEP 3 =====================================================================
-- Point auth.users at it. Drops whatever is currently wired up to
-- handle_new_user first, whatever it happens to be called, so this is safe to
-- re-run and safe if the old trigger had a different name.

do $blk$
declare r record;
begin
  for r in
    select t.tgname
      from pg_trigger t
      join pg_proc p on p.oid = t.tgfoid
     where t.tgrelid = 'auth.users'::regclass
       and not t.tgisinternal
       and p.proname = 'handle_new_user'
  loop
    execute format('drop trigger if exists %I on auth.users', r.tgname);
  end loop;
end
$blk$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- STEP 4 =====================================================================
-- Check it took. You should get exactly one row back:
--   on_auth_user_created | handle_new_user | t
-- The third column is "is it security definer" — it must be t.

select t.tgname as trigger_name,
       p.proname as function_name,
       p.prosecdef as is_security_definer
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
 where t.tgrelid = 'auth.users'::regclass
   and not t.tgisinternal;


-- STEP 5 =====================================================================
-- Prove it works, without creating a real account.
--
-- This inserts a fake auth user, checks the profile the trigger built, then
-- deletes both again at the end of the block. Run the whole block in one go.
-- If any check fails it raises, and nothing is left behind.

do $blk$
declare
  uid uuid := gen_random_uuid();
  got record;
begin
  insert into auth.users (id, email, raw_user_meta_data, instance_id,
                          aud, role, created_at, updated_at)
  values (
    uid,
    'trigger-check-' || uid || '@example.com',
    jsonb_build_object(
      'first_name', 'Trigger',
      'last_name', 'Check',
      'gender', 'undisclosed',
      'phone', '+10000000000',
      'citizenship', 'Argentina',
      'country_of_residence', 'Argentina',
      'source_of_funds', jsonb_build_array('employment', 'investments'),
      'funds_range', '10k_50k',
      -- Deliberately hostile: the trigger must ignore this outright.
      'account_status', 'verified'
    ),
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', now(), now()
  );

  select first_name, last_name, phone, funds_range, account_status,
         source_of_funds
    into got
    from public.profiles where id = uid;

  if got is null then
    raise exception 'FAIL: no profile row was created';
  end if;

  if got.first_name is distinct from 'Trigger' then
    raise exception 'FAIL: first_name came through as %', got.first_name;
  end if;

  if got.funds_range is distinct from '10k_50k' then
    raise exception 'FAIL: funds_range came through as %', got.funds_range;
  end if;

  if got.account_status is distinct from 'unverified' then
    raise exception
      'FAIL: account_status is % — metadata was trusted, which is the exact hole this was meant to close',
      got.account_status;
  end if;

  raise notice 'PASS: profile built from metadata, account_status forced to unverified';
  raise notice 'PASS: source_of_funds stored as %', got.source_of_funds;

  -- Undo everything this block did.
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end
$blk$;


-- STEP 6 =====================================================================
-- Only after the app is deployed with the new signup code:
-- Authentication -> Providers -> Email -> turn "Confirm email" ON.
--
-- Until then leave it off. The new signup code works either way, so there is
-- no window where the two are out of step.

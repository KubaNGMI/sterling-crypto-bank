-- ===========================================================================
-- Sterling Crypto Bank — wipe the accounts and start clean
--
-- Run these in the Supabase SQL editor, one STEP at a time, top to bottom.
-- STEP 0 only looks. Nothing is destroyed until STEP 2.
--
-- ⚠️ THIS IS PERMANENT. There is no undo, and Supabase's free plan has no
-- point-in-time restore. Read STEP 0's output before running STEP 2.
--
-- ⚠️ YOUR ADMIN ACCOUNT. public.is_admin() is hardcoded to the single uid
--    2fec6064-dce3-423a-9ab3-90fd760302dc
-- Delete that account and signing up again gives you a NEW id, which is_admin()
-- will not match — the admin panel disappears for everyone, permanently, until
-- you edit the function. STEP 2 keeps it. STEP 4 is the version that does not,
-- and tells you what to change afterwards.
-- ===========================================================================


-- STEP 0 =====================================================================
-- Look before you leap. Changes nothing.

-- Every account, what it holds, and whether it is the admin.
select
  u.id,
  u.email,
  (u.id = '2fec6064-dce3-423a-9ab3-90fd760302dc'::uuid) as is_admin_account,
  u.created_at,
  u.last_sign_in_at,
  (select count(*) from public.transactions  t where t.user_id = u.id) as transactions,
  (select count(*) from public.bank_accounts b where b.user_id = u.id) as bank_accounts,
  (select count(*) from public.verifications v where v.user_id = u.id) as verifications,
  (select count(*) from storage.objects      o
     where o.bucket_id = 'kyc-documents'
       and (storage.foldername(o.name))[1] = u.id::text)               as stored_files
from auth.users u
order by is_admin_account desc, u.created_at;

-- Row counts per table, so you can sanity-check the "after" numbers later.
select 'profiles' as table, count(*) from public.profiles
union all select 'transactions',  count(*) from public.transactions
union all select 'bank_accounts', count(*) from public.bank_accounts
union all select 'verifications', count(*) from public.verifications
union all select 'notifications', count(*) from public.notifications
union all select 'auth.users',    count(*) from auth.users
union all select 'kyc files',     count(*) from storage.objects where bucket_id = 'kyc-documents';


-- STEP 1 =====================================================================
-- Does deleting an auth user clean up after itself, or leave orphans?
-- Look at delete_rule: CASCADE means the child rows go automatically;
-- NO ACTION or RESTRICT means STEP 2 has to delete them first (it does).

select tc.table_name, kcu.column_name, rc.delete_rule
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_name = tc.constraint_name
  join information_schema.referential_constraints rc
    on rc.constraint_name = tc.constraint_name
 where tc.constraint_type = 'FOREIGN KEY'
   and tc.table_schema = 'public'
   and kcu.column_name in ('user_id', 'id')
 order by tc.table_name;


-- STEP 2 =====================================================================
-- THE DESTRUCTIVE ONE. Deletes every account except the admin, oldest child
-- rows first so it works whether or not the foreign keys cascade.
--
-- It runs in a single transaction: if any part fails, nothing is deleted.
-- It prints what it removed.

do $blk$
declare
  keep uuid := '2fec6064-dce3-423a-9ab3-90fd760302dc';
  n_tx int; n_bank int; n_ver int; n_note int; n_prof int; n_file int; n_user int;
begin
  delete from public.transactions  where user_id <> keep;                 get diagnostics n_tx   = row_count;
  delete from public.bank_accounts where user_id <> keep;                 get diagnostics n_bank = row_count;
  delete from public.verifications where user_id <> keep;                 get diagnostics n_ver  = row_count;
  delete from public.notifications where user_id <> keep;                 get diagnostics n_note = row_count;

  -- Storage rows for everyone else. NOTE: this removes the database records.
  -- The underlying files are cleaned up by Supabase, but if you want to be
  -- certain, also empty the folders in Storage → kyc-documents in the
  -- dashboard afterwards.
  delete from storage.objects
   where bucket_id = 'kyc-documents'
     and (storage.foldername(name))[1] <> keep::text;                     get diagnostics n_file = row_count;

  delete from public.profiles where id <> keep;                           get diagnostics n_prof = row_count;
  delete from auth.users      where id <> keep;                           get diagnostics n_user = row_count;

  raise notice 'deleted: % transactions, % bank accounts, % verifications, % notifications, % stored files, % profiles, % auth users',
    n_tx, n_bank, n_ver, n_note, n_file, n_prof, n_user;
end
$blk$;


-- STEP 3 =====================================================================
-- Confirm. Expect exactly one row (you), and your own balance intact.

select u.id, u.email,
       (u.id = '2fec6064-dce3-423a-9ab3-90fd760302dc'::uuid) as is_admin_account,
       (select count(*) from public.transactions t where t.user_id = u.id) as transactions
  from auth.users u;

select 'profiles' as table, count(*) from public.profiles
union all select 'transactions',  count(*) from public.transactions
union all select 'auth.users',    count(*) from auth.users;


-- ===========================================================================
-- STEP 4 — OPTIONAL, AND THE ONE THAT CAN LOCK YOU OUT
--
-- Only if you truly want a completely empty database, your own account
-- included. Do NOT run this unless you are ready to do the fix underneath it.
--
--   delete from public.transactions;
--   delete from public.bank_accounts;
--   delete from public.verifications;
--   delete from public.notifications;
--   delete from storage.objects where bucket_id = 'kyc-documents';
--   delete from public.profiles;
--   delete from auth.users;
--
-- AFTERWARDS, to get admin back:
--   1. Sign up again at https://sterlingbank.org.
--   2. Find your new id:   select id, email from auth.users;
--   3. Put it into BOTH places, or the admin panel stays hidden:
--        a) create or replace function public.is_admin() ... with the new uid
--           (copy the whole function from supabase/rls-policies.sql, STEP 1)
--        b) src/config/admins.js — the UI gate, which is by email
--   4. Your new account starts unverified, like anyone else's.
-- ===========================================================================

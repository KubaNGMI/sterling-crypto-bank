// Admins are gated by email here — no DB role, no server. Add an address to
// grant access, then redeploy. This is UI gating only; real protection would
// need Supabase RLS policies keyed to the same address (see the migration).
export const ADMIN_EMAILS = ["kubausubaliev7331@gmail.com"];

export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

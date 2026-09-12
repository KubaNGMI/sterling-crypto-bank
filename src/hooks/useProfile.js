import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Keep a copy of the display name on the auth user. That copy travels with the
// session, so the *next* load has a name to greet with before the profiles row
// has even been asked for — which is the difference between the dashboard
// opening with your name on it and opening with a placeholder that swaps a
// moment later.
//
// Accounts created before signup started sending this have no such copy, so it
// gets written the first time their profile is read. Comparing before writing
// keeps it to once per account, and keeps an auth write off the common path.
//
// Display fields only. user_metadata is writable by the user it belongs to, so
// account_status and anything else that grants access or standing stays in
// profiles, guarded by the trigger, and is never read back out of here.
async function syncNameToAuthMetadata(user, profile) {
  const first = profile?.first_name ?? "";
  const last = profile?.last_name ?? "";
  if (!first && !last) return;

  const meta = user?.user_metadata ?? {};
  if (meta.first_name === first && meta.last_name === last) return;

  await supabase.auth.updateUser({ data: { first_name: first, last_name: last } });
}

// The signed-in user's full profiles row. select("*") so a not-yet-migrated
// database returns a row without a new field instead of a 400.
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data ?? null);
    setLoading(false);

    // After the row is on screen, never before it: this is housekeeping, and
    // a failure here costs a name on the next load, not this render.
    syncNameToAuthMetadata(user, data);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}

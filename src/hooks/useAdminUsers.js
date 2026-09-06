import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { mockLatency } from "../utils/mockLatency";

export const ACCOUNT_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "suspended",
];

// Every profile, each with its latest verification-doc record attached.
export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    await mockLatency();

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("*");

    if (pErr) {
      setError(pErr.message);
      setLoading(false);
      return;
    }

    const { data: verifications } = await supabase
      .from("verifications")
      .select("*");

    const vByUser = Object.fromEntries(
      (verifications || []).map((v) => [v.user_id, v])
    );

    const rows = (profiles || [])
      .map((p) => ({ ...p, verification: vByUser[p.id] || null }))
      .sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));

    setUsers(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchUsers();
  }, [fetchUsers]);

  // Returns the updated row so callers can reflect it without a full refetch.
  const updateStatus = useCallback(async (userId, status) => {
    await mockLatency(500, 1500);
    const { error: uErr } = await supabase
      .from("profiles")
      .update({ account_status: status })
      .eq("id", userId);
    if (uErr) throw new Error(uErr.message);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, account_status: status } : u))
    );
  }, []);

  return { users, loading, error, refetch: fetchUsers, updateStatus };
}

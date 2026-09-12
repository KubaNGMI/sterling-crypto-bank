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

// What an admin can decide about a submitted document set. "pending" is the
// state the upload arrives in, not something you set by hand.
export const DOC_REVIEW_STATUSES = ["approved", "rejected"];

// Ruling on the documents carries the account with it.
const DOC_REVIEW_TO_ACCOUNT = { approved: "verified", rejected: "rejected" };

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

  // Ruling on the documents moves the account with it — signing off on the
  // paperwork is what verification means here, so it is one decision rather
  // than two.
  //
  // Two writes, not one transaction: if the second fails the caller gets the
  // error and the account simply hasn't moved yet. Both are idempotent, so
  // clicking again finishes the job.
  const updateDocReview = useCallback(async (userId, status) => {
    await mockLatency(500, 1500);

    const { error: vErr } = await supabase
      .from("verifications")
      .update({ status })
      .eq("user_id", userId);
    if (vErr) throw new Error(vErr.message);

    const accountStatus = DOC_REVIEW_TO_ACCOUNT[status];
    if (accountStatus) {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ account_status: accountStatus })
        .eq("id", userId);
      if (pErr) throw new Error(pErr.message);
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              account_status: accountStatus ?? u.account_status,
              verification: u.verification
                ? { ...u.verification, status }
                : u.verification,
            }
          : u
      )
    );
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateStatus,
    updateDocReview,
  };
}

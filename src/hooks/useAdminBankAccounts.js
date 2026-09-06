import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { mockLatency } from "../utils/mockLatency";

// Every linked bank account across all users, for admin review.
export function useAdminBankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await mockLatency();
    const { data, error: fErr } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (fErr) setError(fErr.message);
    else setAccounts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchAll();
  }, [fetchAll]);

  const setStatus = useCallback(async (id, status) => {
    await mockLatency(500, 1400);
    const { error: uErr } = await supabase
      .from("bank_accounts")
      .update({ status })
      .eq("id", id);
    if (uErr) throw new Error(uErr.message);
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  return { accounts, loading, error, refetch: fetchAll, setStatus };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { mockLatency } from "../utils/mockLatency";

// The signed-in user's linked bank accounts. Statements are stored in the
// existing kyc-documents bucket under <user_id>/bank/<id>.<ext>.
export function useBankAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    await mockLatency();
    const { data, error: fErr } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (fErr) setError(fErr.message);
    else setAccounts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(
    async ({
      region,
      currency,
      accountName,
      bsb,
      accountNumber,
      payid,
      bankName,
      statementFile,
    }) => {
      if (!user) throw new Error("You need to be signed in.");
      await mockLatency(800, 1800);

      const id = crypto.randomUUID();
      let statementPath = null;
      if (statementFile) {
        const ext = statementFile.name.split(".").pop();
        const path = `${user.id}/bank/${id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("kyc-documents")
          .upload(path, statementFile, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        statementPath = path;
      }

      const { error: insErr } = await supabase.from("bank_accounts").insert({
        id,
        user_id: user.id,
        region,
        currency,
        account_name: accountName,
        bsb: bsb || null,
        account_number: accountNumber,
        payid: payid || null,
        bank_name: bankName || null,
        status: "pending",
        statement_path: statementPath,
      });
      if (insErr) throw new Error(insErr.message);
      await fetchAccounts();
    },
    [user, fetchAccounts]
  );

  const removeAccount = useCallback(
    async (acct) => {
      await mockLatency(400, 1000);
      if (acct.statement_path) {
        await supabase.storage.from("kyc-documents").remove([acct.statement_path]);
      }
      const { error: dErr } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", acct.id);
      if (dErr) throw new Error(dErr.message);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  return { accounts, loading, error, refetch: fetchAccounts, addAccount, removeAccount };
}

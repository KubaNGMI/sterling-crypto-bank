import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { mockLatency } from "../utils/mockLatency";

// Manual money operations. Everything the wallet views show is derived from the
// transactions table, so an admin insert here flows straight into a user's
// balance / holdings with no extra wiring.
export function useAdminLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await mockLatency();
    const { data, error: fErr } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (fErr) setError(fErr.message);
    else setTransactions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchAll();
  }, [fetchAll]);

  const post = useCallback(
    async (rows) => {
      await mockLatency(600, 1600);
      // Tagged so the DB notification trigger fires immediately for these —
      // only self-initiated (AddFunds/TradePanel) rows get the delayed
      // client-side notification instead.
      const tagged = rows.map((r) => ({ ...r, source: "admin" }));
      const { error: iErr } = await supabase.from("transactions").insert(tagged);
      if (iErr) throw new Error(iErr.message);
      await fetchAll();
    },
    [fetchAll]
  );

  const deposit = useCallback(
    (userId, usd, note, pending = false) =>
      post([
        {
          user_id: userId,
          type: "deposit",
          usd_amount: Math.abs(usd),
          coin_symbol: null,
          coin_amount: null,
          note: note || "Manual deposit",
          status: pending ? "pending" : "completed",
        },
      ]),
    [post]
  );

  const withdraw = useCallback(
    (userId, usd, note, pending = false) =>
      post([
        {
          user_id: userId,
          type: "withdrawal",
          usd_amount: -Math.abs(usd),
          coin_symbol: null,
          coin_amount: null,
          note: note || "Manual withdrawal",
          status: pending ? "pending" : "completed",
        },
      ]),
    [post]
  );

  const transfer = useCallback(
    (fromId, toId, usd, note, pending = false) => {
      const groupId = crypto.randomUUID();
      const amount = Math.abs(usd);
      const status = pending ? "pending" : "completed";
      return post([
        {
          user_id: fromId,
          type: "transfer_out",
          usd_amount: -amount,
          coin_symbol: null,
          coin_amount: null,
          group_id: groupId,
          note: note || "Transfer out",
          status,
        },
        {
          user_id: toId,
          type: "transfer_in",
          usd_amount: amount,
          coin_symbol: null,
          coin_amount: null,
          group_id: groupId,
          note: note || "Transfer in",
          status,
        },
      ]);
    },
    [post]
  );

  // Signed coin_amount: positive credits the holding, negative debits it.
  // usd_amount stays 0 so a coin grant doesn't move the cash balance.
  const adjustCoin = useCallback(
    (userId, symbol, signedAmount, note, pending = false) =>
      post([
        {
          user_id: userId,
          type: "adjustment",
          usd_amount: 0,
          coin_symbol: symbol,
          coin_amount: signedAmount,
          note: note || "Coin adjustment",
          status: pending ? "pending" : "completed",
        },
      ]),
    [post]
  );

  // Deletes the entry (or both legs of a transfer). Balances recompute.
  const reverse = useCallback(
    async (tx) => {
      await mockLatency(500, 1300);
      const query = supabase.from("transactions").delete();
      const { error: dErr } = tx.group_id
        ? await query.eq("group_id", tx.group_id)
        : await query.eq("id", tx.id);
      if (dErr) throw new Error(dErr.message);
      await fetchAll();
    },
    [fetchAll]
  );

  // Marks a pending entry (or both legs of a pending transfer) as completed,
  // folding it into balances/holdings on the next fetch.
  const confirm = useCallback(
    async (tx) => {
      await mockLatency(400, 1000);
      const query = supabase.from("transactions").update({ status: "completed" });
      const { error: cErr } = tx.group_id
        ? await query.eq("group_id", tx.group_id)
        : await query.eq("id", tx.id);
      if (cErr) throw new Error(cErr.message);
      await fetchAll();
    },
    [fetchAll]
  );

  return {
    transactions,
    loading,
    error,
    refetch: fetchAll,
    deposit,
    withdraw,
    transfer,
    adjustCoin,
    reverse,
    confirm,
  };
}

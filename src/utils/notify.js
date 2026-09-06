import { supabase } from "../supabaseClient";

// Self-initiated actions (AddFunds, TradePanel) don't get an instant
// notification from the DB trigger — that only fires for admin-sourced rows.
// Instead we schedule one client-side, arriving 30-50s later, so it feels
// like something was actually processed rather than an instant echo of the
// action the user just took. The underlying transaction has already
// committed by the time this fires — this only affects when the user is
// told about it, not the money itself.
export function scheduleUserNotification({ userId, transactionId, title, body }) {
  const delayMs = (30 + Math.random() * 20) * 1000;
  setTimeout(() => {
    supabase
      .from("notifications")
      .insert({ user_id: userId, transaction_id: transactionId, title, body })
      .then(({ error }) => {
        if (error) console.error("Failed to post notification:", error.message);
      });
  }, delayMs);
}

import { useCallback } from "react";
import { supabase } from "../supabaseClient";
import { mockLatency } from "../utils/mockLatency";

// A free-text message from the platform to one user. Inserted straight into
// the notifications table with kind = "message" — the user's realtime
// subscription picks it up and pops it as a modal.
export function useAdminMessages() {
  const sendMessage = useCallback(async (userId, title, body) => {
    await mockLatency(600, 1400);
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      transaction_id: null,
      title: title.trim(),
      body: body.trim(),
      kind: "message",
    });
    if (error) throw new Error(error.message);
  }, []);

  return { sendMessage };
}

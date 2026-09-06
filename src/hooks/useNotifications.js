import { useContext } from "react";
import { NotificationsContext } from "../context/notificationsContext";

// Reads the shared subscription from NotificationsProvider (mounted once
// above the dashboard shell) — no per-component fetching or realtime
// channel here.
export function useNotifications() {
  return useContext(NotificationsContext);
}

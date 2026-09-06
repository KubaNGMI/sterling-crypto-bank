import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { NotificationsContext } from "./notificationsContext";
import NotificationToast from "../components/NotificationToast";
import AdminMessageModal from "../components/AdminMessageModal";

const TOAST_DURATION = 5000;

// One shared subscription, mounted once above the dashboard shell — the
// Sidebar renders two NotificationBell instances (desktop rail + mobile app
// bar, CSS picks which one shows), so this can't live inside the hook
// itself or each one would open its own realtime channel and double-fire
// every toast.
export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const didAutoOpen = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setNotifications(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
    fetchAll();
  }, [fetchAll]);

  // A message sent while the user was offline: surface the newest unread one
  // once on first load.
  useEffect(() => {
    if (loading || didAutoOpen.current) return;
    didAutoOpen.current = true;
    const unread = notifications.find((n) => n.kind === "message" && !n.read);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot surface of an offline message on first load
    if (unread) setActiveMessage(unread);
  }, [loading, notifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new;
          setNotifications((prev) => [row, ...prev]);
          toast.custom(
            (id) => (
              <NotificationToast
                id={id}
                title={row.title}
                body={row.body}
                kind={row.kind}
                duration={TOAST_DURATION}
              />
            ),
            { duration: TOAST_DURATION, unstyled: true }
          );
          if (row.kind === "message") setActiveMessage(row);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => {
      const unreadIds = prev.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        supabase.from("notifications").update({ read: true }).in("id", unreadIds);
      }
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const openMessage = useCallback((n) => setActiveMessage(n), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, markRead, markAllRead, openMessage }),
    [notifications, unreadCount, loading, markRead, markAllRead, openMessage]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {activeMessage && (
        <AdminMessageModal
          notification={activeMessage}
          onClose={() => {
            markRead(activeMessage.id);
            setActiveMessage(null);
          }}
        />
      )}
    </NotificationsContext.Provider>
  );
}

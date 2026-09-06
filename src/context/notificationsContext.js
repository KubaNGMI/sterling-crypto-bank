import { createContext } from "react";

// Plain data module (no JSX) so react-refresh doesn't flag it for mixing
// component and non-component exports — see NotificationsProvider.jsx for
// the component that actually populates this.
export const NotificationsContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markRead: () => {},
  markAllRead: () => {},
  openMessage: () => {},
});

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead, openMessage } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  function openNotification(n) {
    markRead(n.id);
    setOpen(false);
    if (n.kind === "message") {
      openMessage(n);
      return;
    }
    navigate("/wallet", {
      state: {
        openTransaction: n.transaction_id ?? null,
        scrollTo: "transaction-history",
      },
    });
  }

  useEffect(() => {
    function onDocMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="notif-bell__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6.5a4 4 0 0 1 8 0v2.8l1.2 2.2H2.8L4 9.3V6.5Z" />
          <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel__head">
            <p className="notif-panel__title">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" className="notif-panel__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-panel__list">
            {loading ? (
              <p className="notif-panel__loading">Loading…</p>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={emptyIcons.bank}
                title="No notifications yet"
                hint="Deposits, trades, and account activity will show up here."
              />
            ) : (
              notifications.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={"notif-row" + (n.read ? "" : " unread")}
                  onClick={() => openNotification(n)}
                >
                  {!n.read && <span className="notif-row__dot" aria-hidden="true" />}
                  <div className="notif-row__text">
                    <p className="notif-row__title">{n.title}</p>
                    <p className="notif-row__body">{n.body}</p>
                  </div>
                  <span className="notif-row__time">{relativeTime(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notif-bell { position: relative; }
        .notif-bell__trigger {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: var(--fill);
          color: var(--text-muted);
          transition: color 0.15s, border-color 0.15s;
        }
        .notif-bell__trigger:hover { color: var(--text); border-color: var(--accent); }
        .notif-bell__trigger svg { width: 17px; height: 17px; }
        .notif-bell__badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 999px;
          background: var(--red);
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .notif-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 40;
          width: 340px;
          max-width: calc(100vw - 32px);
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          animation: pop-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* On mobile the bell isn't the rightmost element in its bar (the
           menu button is), so a panel anchored to the bell's own right edge
           can overflow off the left of the screen. Pin it to the viewport
           instead, same as .mobile-menu does. */
        @media (max-width: 768px) {
          .notif-panel {
            position: fixed;
            top: calc(64px + env(safe-area-inset-top));
            right: 12px;
            left: 12px;
            width: auto;
            max-width: none;
          }
        }
        .notif-panel__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
        }
        .notif-panel__title { font-size: 14px; font-weight: 600; }
        .notif-panel__mark-all {
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent);
          background: none;
          border: none;
        }
        .notif-panel__mark-all:hover { color: var(--accent-deep); }

        .notif-panel__list {
          max-height: 360px;
          overflow-y: auto;
        }
        .notif-panel__loading {
          padding: 24px 16px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        .notif-row {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
          padding: 12px 16px 12px 24px;
          border: none;
          border-bottom: 1px solid var(--glass-border);
          background: none;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .notif-row:last-child { border-bottom: none; }
        .notif-row:hover { background: var(--fill-hover); }
        .notif-row.unread { background: var(--fill); }
        .notif-row__dot {
          position: absolute;
          left: 10px;
          top: 17px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .notif-row__text { flex: 1; min-width: 0; }
        .notif-row__title { font-size: 13px; font-weight: 600; color: var(--text); }
        .notif-row__body { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        .notif-row__time {
          flex-shrink: 0;
          font-size: 11.5px;
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

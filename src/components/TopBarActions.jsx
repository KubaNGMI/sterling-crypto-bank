import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

// Sits at the top-right of every page's content area (desktop only — mobile
// keeps its own bell in the app bar). Previously the bell lived in the
// Sidebar, but anchoring a wide dropdown to a trigger that close to the
// left edge of the screen pushed most of the panel off-canvas. Living here,
// near the right edge, gives it room to open normally.
export default function TopBarActions() {
  return (
    <div className="topbar-actions-global">
      <NotificationBell />
      <Link to="/profile" className="avatar" aria-label="Go to your profile">
        {/* The sidebar's profile glyph without its enclosing ring — the avatar
            is already a circle, so the ring would just double up. */}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 8.66669C9.10457 8.66669 10 7.77126 10 6.66669C10 5.56212 9.10457 4.66669 8 4.66669C6.89543 4.66669 6 5.56212 6 6.66669C6 7.77126 6.89543 8.66669 8 8.66669Z" />
          <path d="M4.112 12.566C4.27701 12.0168 4.61465 11.5355 5.07483 11.1933C5.53502 10.8512 6.09323 10.6665 6.66667 10.6667H9.33333C9.90751 10.6665 10.4664 10.8516 10.9269 11.1945C11.3874 11.5375 11.725 12.0199 11.8893 12.57" />
        </svg>
      </Link>

      <style>{`
        .topbar-actions-global {
          position: absolute;
          top: 32px;
          right: 40px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .topbar-actions-global { display: none; }
        }
      `}</style>
    </div>
  );
}

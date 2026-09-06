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
        👤
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

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

import logo from "../assets/Logo.svg";
import NotificationBell from "./NotificationBell";

/* Drawn line icons (16px grid, currentColor) so nav items recolor per state
   instead of shipping fixed-fill <img> glyphs. */
const ICONS = {
  dashboard: (
    <>
      <path d="M12.3333 3H4.33333C3.59695 3 3 3.59695 3 4.33333V12.3333C3 13.0697 3.59695 13.6667 4.33333 13.6667H12.3333C13.0697 13.6667 13.6667 13.0697 13.6667 12.3333V4.33333C13.6667 3.59695 13.0697 3 12.3333 3Z" />
      <path d="M2.66669 8H8.00002" />
      <path d="M8 10H13.3333" />
      <path d="M8 6H13.3333" />
      <path d="M8 2.66669V13.3334" />
    </>
  ),
  wallet: (
    <>
      <path d="M12.6667 10.6667V12.6667C12.6667 12.8435 12.5964 13.0131 12.4714 13.1381C12.3464 13.2631 12.1768 13.3334 12 13.3334H4.00002C3.6464 13.3334 3.30726 13.1929 3.05721 12.9428C2.80716 12.6928 2.66669 12.3536 2.66669 12V4.00002C2.66669 3.6464 2.80716 3.30726 3.05721 3.05721C3.30726 2.80716 3.6464 2.66669 4.00002 2.66669H10.6667C10.8435 2.66669 11.0131 2.73693 11.1381 2.86195C11.2631 2.98697 11.3334 3.15654 11.3334 3.33335V5.33335M2.66669 4.00002C2.66669 4.35364 2.80716 4.69278 3.05721 4.94283C3.30726 5.19288 3.6464 5.33335 4.00002 5.33335H12C12.1768 5.33335 12.3464 5.40359 12.4714 5.52862C12.5964 5.65364 12.6667 5.82321 12.6667 6.00002V8.00002" />
      <path d="M13.3333 8V10.6667H10.6666C10.313 10.6667 9.97389 10.5262 9.72384 10.2761C9.47379 10.0261 9.33331 9.68696 9.33331 9.33333C9.33331 8.97971 9.47379 8.64057 9.72384 8.39052C9.97389 8.14048 10.313 8 10.6666 8H13.3333Z" />
    </>
  ),
  analyze: (
    <>
      <path d="M8.59669 6H7.40335C6.9965 6 6.66669 6.32982 6.66669 6.73667V13.2633C6.66669 13.6702 6.9965 14 7.40335 14H8.59669C9.00354 14 9.33335 13.6702 9.33335 13.2633V6.73667C9.33335 6.32982 9.00354 6 8.59669 6Z" />
      <path d="M13.2633 2H12.07C11.6631 2 11.3333 2.32982 11.3333 2.73667V13.2633C11.3333 13.6702 11.6631 14 12.07 14H13.2633C13.6702 14 14 13.6702 14 13.2633V2.73667C14 2.32982 13.6702 2 13.2633 2Z" />
      <path d="M3.33333 14C4.06971 14 4.66667 13.403 4.66667 12.6666C4.66667 11.9303 4.06971 11.3333 3.33333 11.3333C2.59695 11.3333 2 11.9303 2 12.6666C2 13.403 2.59695 14 3.33333 14Z" />
    </>
  ),
  exchange: (
    <>
      <path d="M2.66669 8V6C2.66669 5.46957 2.8774 4.96086 3.25247 4.58579C3.62755 4.21071 4.13625 4 4.66669 4H13.3334M11.3334 6L13.3334 4L11.3334 2" />
      <path d="M13.3334 8V10C13.3334 10.5304 13.1226 11.0391 12.7476 11.4142C12.3725 11.7893 11.8638 12 11.3334 12H2.66669M4.66669 10L2.66669 12L4.66669 14" />
    </>
  ),
  setting: (
    <>
      <path d="M6.88333 2.878C7.16733 1.70733 8.83267 1.70733 9.11667 2.878C9.15928 3.05387 9.24281 3.21719 9.36047 3.35467C9.47813 3.49215 9.62659 3.5999 9.79377 3.66916C9.96094 3.73843 10.1421 3.76723 10.3225 3.75325C10.5029 3.73926 10.6775 3.68287 10.832 3.58867C11.8607 2.962 13.0387 4.13933 12.412 5.16867C12.3179 5.3231 12.2616 5.49756 12.2477 5.67785C12.2337 5.85814 12.2625 6.03918 12.3317 6.20625C12.4009 6.37333 12.5085 6.52172 12.6458 6.63937C12.7831 6.75702 12.9463 6.8406 13.122 6.88333C14.2927 7.16733 14.2927 8.83267 13.122 9.11667C12.9461 9.15928 12.7828 9.24281 12.6453 9.36047C12.5079 9.47813 12.4001 9.62659 12.3308 9.79377C12.2616 9.96094 12.2328 10.1421 12.2468 10.3225C12.2607 10.5029 12.3171 10.6775 12.4113 10.832C13.038 11.8607 11.8607 13.0387 10.8313 12.412C10.6769 12.3179 10.5024 12.2616 10.3222 12.2477C10.1419 12.2337 9.96082 12.2625 9.79375 12.3317C9.62667 12.4009 9.47828 12.5085 9.36063 12.6458C9.24298 12.7831 9.1594 12.9463 9.11667 13.122C8.83267 14.2927 7.16733 14.2927 6.88333 13.122C6.84072 12.9461 6.75719 12.7828 6.63953 12.6453C6.52187 12.5079 6.37341 12.4001 6.20623 12.3308C6.03906 12.2616 5.85789 12.2328 5.67748 12.2468C5.49706 12.2607 5.3225 12.3171 5.168 12.4113C4.13933 13.038 2.96133 11.8607 3.588 10.8313C3.68207 10.6769 3.73837 10.5024 3.75232 10.3222C3.76628 10.1419 3.7375 9.96082 3.66831 9.79375C3.59913 9.62667 3.49151 9.47828 3.35418 9.36063C3.21686 9.24298 3.05371 9.1594 2.878 9.11667C1.70733 8.83267 1.70733 7.16733 2.878 6.88333C3.05387 6.84072 3.21719 6.75719 3.35467 6.63953C3.49215 6.52187 3.5999 6.37341 3.66916 6.20623C3.73843 6.03906 3.76723 5.85789 3.75325 5.67748C3.73926 5.49706 3.68287 5.3225 3.58867 5.168C2.962 4.13933 4.13933 2.96133 5.16867 3.588C5.83533 3.99333 6.69933 3.63467 6.88333 2.878Z" />
      <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" />
    </>
  ),
  profile: (
    <>
      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" />
      <path d="M8 8.66669C9.10457 8.66669 10 7.77126 10 6.66669C10 5.56212 9.10457 4.66669 8 4.66669C6.89543 4.66669 6 5.56212 6 6.66669C6 7.77126 6.89543 8.66669 8 8.66669Z" />
      <path d="M4.112 12.566C4.27701 12.0168 4.61465 11.5355 5.07483 11.1933C5.53502 10.8512 6.09323 10.6665 6.66667 10.6667H9.33333C9.90751 10.6665 10.4664 10.8516 10.9269 11.1945C11.3874 11.5375 11.725 12.0199 11.8893 12.57" />
    </>
  ),
  logout: (
    <>
      <path d="M9.33333 5.33335V4.00002C9.33333 3.6464 9.19286 3.30726 8.94281 3.05721C8.69276 2.80716 8.35362 2.66669 8 2.66669H3.33333C2.97971 2.66669 2.64057 2.80716 2.39052 3.05721C2.14048 3.30726 2 3.6464 2 4.00002V12C2 12.3536 2.14048 12.6928 2.39052 12.9428C2.64057 13.1929 2.97971 13.3334 3.33333 13.3334H8C8.35362 13.3334 8.69276 13.1929 8.94281 12.9428C9.19286 12.6928 9.33333 12.3536 9.33333 12V10.6667" />
      <path d="M4.66669 8H14M12 10L14 8L12 6" />
    </>
  ),
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
  admin: (
    <path d="M8 1.7 13.3 4v4c0 3.4-2.3 5.6-5.3 6.4C4.9 13.6 2.7 11.4 2.7 8V4L8 1.7Z" />
  ),
};

function Icon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const navItems = [
  { label: "Dashboard", to: "/", icon: "dashboard" },
  { label: "My Wallet", to: "/wallet", icon: "wallet" },
  { label: "Analyze", to: "/analyze", icon: "analyze" },
  { label: "Exchange", to: "/exchange", icon: "exchange" },
];

const accountItems = [
  { label: "Setting", to: "/settings", icon: "setting" },
  { label: "Profile", to: "/profile", icon: "profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);

  const bottomItems = isAdmin
    ? [{ label: "Admin", to: "/admin", icon: "admin" }, ...accountItems]
    : accountItems;

  async function handleLogout() {
    setMenuOpen(false);
    await signOut();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    "sidebar-link" + (isActive ? " active" : "");

  return (
    <>
      {/* ---------- Desktop rail ---------- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="" />
          Sterling
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.to} end={item.to === "/"} className={linkClass}>
                  <Icon name={item.icon} className="sidebar-icon" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          <ul>
            {bottomItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.to} className={linkClass}>
                  <Icon name={item.icon} className="sidebar-icon" />
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button onClick={handleLogout} className="sidebar-link logout-btn">
                <Icon name="logout" className="sidebar-icon" />
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Mobile top app bar ---------- */}
      <header className="mobile-appbar">
        <div className="mobile-appbar__brand">
          <img src={logo} alt="" />
          Sterling
        </div>
        <div className="mobile-appbar__actions">
          <NotificationBell />
          <button
            type="button"
            className={"mobile-appbar__menu" + (menuOpen ? " open" : "")}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name="menu" className="mobile-appbar__menu-icon" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="mobile-menu__backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="mobile-menu" role="menu">
            {bottomItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                role="menuitem"
                className="mobile-menu__item"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={item.icon} className="mobile-menu__icon" />
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              role="menuitem"
              className="mobile-menu__item"
              onClick={handleLogout}
            >
              <Icon name="logout" className="mobile-menu__icon" />
              Log Out
            </button>
          </div>
        </>
      )}

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav className="mobile-tabbar" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              "mobile-tab" + (isActive ? " active" : "")
            }
          >
            <Icon name={item.icon} className="mobile-tab__icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        .sidebar {
          width: 220px;
          background:
            linear-gradient(180deg, rgba(100, 115, 254, 0.10) 0%, rgba(12, 12, 20, 0) 45%),
            var(--sidebar-bg);
          border-right: 1px solid var(--border);
          border-radius: 0 8px 8px 0;
          display: flex;
          flex-direction: column;
          padding: 28px 20px;
          position: sticky;
          top: 0;
          height: 100vh;
          align-self: flex-start;
        }
        .logout-btn {
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 32px;
        }
        .sidebar-logo img { width: 26px; }
        .sidebar-nav { flex: 1; }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          transition: background .15s, color .15s;
        }
        .sidebar-link:hover {
          color: var(--text);
          background: var(--card-bg);
          margin-right: -20px;
          margin-left: -20px;
          padding-right: 34px;
          padding-left: 34px;
        }
        .sidebar-link.active {
          color: #fff;
          border-radius: 0px;
          margin-right: -20px;
          margin-left: -20px;
          padding-right: 34px;
          padding-left: 34px;
          background: linear-gradient(270deg, #6473FE, transparent);
        }
        .sidebar-icon { width: 18px; height: 18px; flex-shrink: 0; }
        .sidebar-bottom ul { border-top: 1px solid var(--border); padding-top: 16px; }

        /* ---------- Mobile chrome (hidden on desktop) ---------- */
        .mobile-appbar,
        .mobile-tabbar { display: none; }

        .mobile-appbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: calc(58px + env(safe-area-inset-top));
          padding: env(safe-area-inset-top) 16px 0;
          align-items: center;
          justify-content: space-between;
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
        }
        .mobile-appbar__brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 700;
        }
        .mobile-appbar__brand img { width: 24px; }
        .mobile-appbar__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mobile-appbar__menu {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: var(--fill);
          color: var(--text-muted);
          transition: color .15s, border-color .15s;
        }
        .mobile-appbar__menu.open {
          color: var(--accent);
          border-color: var(--accent);
        }
        .mobile-appbar__menu-icon { width: 18px; height: 18px; }

        .mobile-menu__backdrop {
          position: fixed;
          inset: 0;
          z-index: 55;
        }
        .mobile-menu {
          position: fixed;
          top: calc(64px + env(safe-area-inset-top));
          right: 12px;
          z-index: 60;
          min-width: 184px;
          padding: 6px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          animation: pop-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-menu__item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          border-radius: 8px;
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          transition: background .15s;
        }
        .mobile-menu__item:hover { background: var(--fill-hover); }
        .mobile-menu__icon { width: 16px; height: 16px; color: var(--text-muted); flex-shrink: 0; }

        .mobile-tabbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          justify-content: space-around;
          gap: 4px;
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
          background: var(--glass-bg-strong);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid var(--glass-border);
        }
        .mobile-tab {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 0;
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color .15s;
        }
        .mobile-tab__icon { width: 20px; height: 20px; }
        .mobile-tab.active { color: var(--accent-text); }
        .mobile-tab.active::before {
          content: "";
          position: absolute;
          top: 0;
          width: 18px;
          height: 2px;
          border-radius: 999px;
          background: var(--accent);
        }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-appbar { display: flex; }
          .mobile-tabbar { display: flex; }
        }
      `}</style>
    </>
  );
}

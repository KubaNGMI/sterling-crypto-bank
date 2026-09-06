import { Link } from "react-router-dom";

/**
 * Shared empty-state block for cards with no data yet.
 *
 * props:
 *   icon   — inline <svg> (drawn, stroke="currentColor"); optional
 *   title  — short headline, names what's missing
 *   hint   — one sentence of guidance; optional
 *   action — quiet button below the text; optional. Either
 *            { label, to } (router Link) or { label, onClick } (button).
 */
export default function EmptyState({ icon, title, hint, action, className = "" }) {
  return (
    <div className={"empty-state " + className}>
      {icon && (
        <span className="empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {hint && <p className="empty-state__hint">{hint}</p>}
      {action &&
        (action.onClick ? (
          <button type="button" className="empty-state__action" onClick={action.onClick}>
            {action.label}
          </button>
        ) : (
          <Link className="empty-state__action" to={action.to}>
            {action.label}
          </Link>
        ))}

      <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 6px;
          padding: 40px 24px;
          min-height: 216px;
        }
        .empty-state__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-bottom: 6px;
          border-radius: 12px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
        }
        .empty-state__icon svg { width: 20px; height: 20px; display: block; }
        .empty-state__title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .empty-state__hint {
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--text-muted);
          max-width: 34ch;
        }
        .empty-state__action {
          margin-top: 12px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 9px 18px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .empty-state__action:hover {
          border-color: var(--accent);
          background: var(--fill);
        }
      `}</style>
    </div>
  );
}

import { toast } from "sonner";
import { COINS, isImageIcon } from "../coins";

// Bodies our notifications produce end with a coin symbol ("+0.012524 BTC")
// or contain a "$" for cash ("+$5,000.00"). Pull the coin out when there is
// one so the toast can show its icon.
function coinFromBody(body) {
  const last = String(body).trim().split(/\s+/).pop();
  return COINS[last] && !COINS[last].isCash ? last : null;
}

export default function NotificationToast({ id, title, body, duration, kind }) {
  const isMessage = kind === "message";
  const symbol = isMessage ? null : coinFromBody(body);
  const coin = symbol ? COINS[symbol] : null;

  return (
    <div className="ntoast" role="status">
      <span className="ntoast__icon" aria-hidden="true">
        {isMessage ? (
          <svg className="ntoast__msg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
            <path d="M2.5 4.5 8 9l5.5-4.5" />
          </svg>
        ) : coin && isImageIcon(coin.icon) ? (
          <img src={coin.icon} alt="" />
        ) : (
          <span className="ntoast__glyph">{coin?.icon ?? "$"}</span>
        )}
      </span>

      <div className="ntoast__text">
        <p className="ntoast__title">{title}</p>
        <p className="ntoast__body">{body}</p>
      </div>

      <button
        type="button"
        className="ntoast__close"
        onClick={() => toast.dismiss(id)}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      <span
        className="ntoast__bar"
        style={{ animationDuration: `${duration}ms` }}
        aria-hidden="true"
      />

      <style>{`
        .ntoast {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 340px;
          max-width: calc(100vw - 32px);
          padding: 14px 14px 15px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }
        .ntoast__icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--fill-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .ntoast__icon img { width: 100%; height: 100%; object-fit: contain; }
        .ntoast__glyph { font-size: 15px; color: var(--text-muted); }
        .ntoast__msg { width: 16px; height: 16px; color: var(--accent); }
        .ntoast__text { flex: 1; min-width: 0; }
        .ntoast__title { font-size: 13px; font-weight: 600; color: var(--text); }
        .ntoast__body { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        .ntoast__close {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          color: var(--text-muted);
          border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .ntoast__close:hover { color: var(--text); background: var(--fill-hover); }
        .ntoast__close svg { width: 12px; height: 12px; }
        .ntoast__bar {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          background: var(--accent);
          transform-origin: left;
          animation-name: ntoast-bar;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes ntoast-bar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        /* Sonner pauses a toast's dismiss timer whenever the stack is
           hovered or focused — keep the bar in step with that. */
        [data-sonner-toaster]:hover .ntoast__bar,
        [data-sonner-toaster]:focus-within .ntoast__bar {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ntoast__bar { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

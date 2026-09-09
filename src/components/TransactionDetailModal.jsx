import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatUsd } from "../utils/format";

export default function TransactionDetailModal({ transaction, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const t = transaction;
  const usd = Number(t.usd_amount);
  const coinAmount = Number(t.coin_amount);
  const isCoin = t.coin_symbol && !Number.isNaN(coinAmount) && coinAmount !== 0;
  const pending = t.status === "pending";

  // Portalled to <body>: every .card sets transform: translateZ(0) for
  // backdrop-blur compositing, which makes it the containing block for
  // position: fixed, and overflow: hidden, which clips anything escaping it.
  // This modal renders outside a card today, but the portal means it keeps
  // working if it is ever moved inside one.
  return createPortal(
    <div className="txd-backdrop" onClick={onClose}>
      <div
        className="card txd-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Transaction details"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="txd-head">
          <div className="txd-badges">
            <span className="txd-type">{String(t.type).replace("_", " ")}</span>
            <span className={"txd-status txd-status--" + (pending ? "pending" : "completed")}>
              {pending ? "Pending" : "Completed"}
            </span>
          </div>
          <button className="txd-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <div className="txd-amount">
          <span className={usd >= 0 ? "txd-amount--pos" : "txd-amount--neg"}>
            {usd >= 0 ? "+" : "-"}
            {formatUsd(Math.abs(usd))}
          </span>
          {isCoin && (
            <span className="txd-amount-coin">
              {coinAmount >= 0 ? "+" : ""}
              {coinAmount} {t.coin_symbol}
            </span>
          )}
        </div>

        <dl className="txd-details">
          <div>
            <dt>Date &amp; time</dt>
            <dd>
              {new Date(t.created_at).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "medium",
              })}
            </dd>
          </div>
          <div>
            <dt>Coin</dt>
            <dd>{t.coin_symbol || "FIAT"}</dd>
          </div>
          <div>
            <dt>Transaction ID</dt>
            <dd className="txd-mono">{t.id}</dd>
          </div>
        </dl>

        <div className="txd-note">
          <p className="txd-note__label">Message from Sterling</p>
          <p className="txd-note__body">
            {t.note || "No message from the platform for this transaction."}
          </p>
        </div>

        <style>{`
          .txd-backdrop {
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(4, 4, 10, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            animation: txd-fade 0.15s ease;
          }
          @keyframes txd-fade { from { opacity: 0; } to { opacity: 1; } }

          .txd-modal {
            width: min(440px, 100%);
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            animation: pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .txd-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 20px;
          }
          .txd-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .txd-type,
          .txd-status {
            display: inline-block;
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 999px;
          }
          .txd-type { background: var(--fill-hover); color: var(--text-muted); }
          .txd-status--completed { background: var(--wash-green-strong); color: var(--green); }
          .txd-status--pending { background: var(--wash-amber-strong); color: var(--orange); }
          .txd-close {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            background: none;
            color: var(--text-muted);
            transition: color 0.15s, border-color 0.15s;
          }
          .txd-close svg { width: 16px; height: 16px; }
          .txd-close:hover { color: var(--text); border-color: var(--accent); }

          .txd-amount {
            display: flex;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--glass-border);
          }
          .txd-amount--pos { font-size: 26px; font-weight: 700; color: var(--green); }
          .txd-amount--neg { font-size: 26px; font-weight: 700; color: var(--red); }
          .txd-amount-coin { font-size: 14px; font-weight: 600; color: var(--text-muted); }

          .txd-details {
            display: flex;
            flex-direction: column;
            gap: 14px;
            padding: 20px 0;
            border-bottom: 1px solid var(--glass-border);
          }
          .txd-details div { display: flex; flex-direction: column; gap: 4px; }
          .txd-details dt { font-size: 12.5px; color: var(--text-muted); }
          .txd-details dd { font-size: 14px; font-weight: 500; }
          .txd-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 12.5px !important;
            font-weight: 400 !important;
            color: var(--text-muted);
            word-break: break-all;
          }

          .txd-note { padding-top: 20px; }
          .txd-note__label {
            font-size: 12.5px;
            color: var(--text-muted);
            margin-bottom: 8px;
          }
          .txd-note__body {
            font-size: 13px;
            line-height: 1.5;
            color: var(--text);
            background: var(--fill);
            border: 1px solid var(--glass-border);
            border-left: 3px solid var(--accent);
            border-radius: 8px;
            padding: 12px 14px;
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
}

import { useEffect } from "react";

export default function AdminMessageModal({ notification, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const n = notification;
  const when = new Date(n.created_at).toLocaleDateString("en-US", {
    dateStyle: "long",
  });

  return (
    <div className="amm-backdrop" onClick={onClose}>
      <div
        className="card amm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Message from Sterling"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="amm-head">
          <span className="amm-badge">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
              <path d="M2.5 4.5 8 9l5.5-4.5" />
            </svg>
            Message
          </span>
          <button className="amm-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <h2 className="amm-title">{n.title}</h2>
        <p className="amm-meta">From the Sterling team · {when}</p>

        <div className="amm-body">{n.body}</div>

        <button type="button" className="amm-ack" onClick={onClose}>
          Got it
        </button>

        <style>{`
          .amm-backdrop {
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
            animation: amm-fade 0.15s ease;
          }
          @keyframes amm-fade { from { opacity: 0; } to { opacity: 1; } }

          .amm-modal {
            width: min(460px, 100%);
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            animation: pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .amm-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
          }
          .amm-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 4px 10px 4px 8px;
            border-radius: 999px;
            background: rgba(99, 102, 241, 0.15);
            color: var(--accent-text);
          }
          .amm-badge svg { width: 13px; height: 13px; }
          .amm-close {
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
          .amm-close svg { width: 16px; height: 16px; }
          .amm-close:hover { color: var(--text); border-color: var(--accent); }

          .amm-title { font-size: 22px; font-weight: 700; }
          .amm-meta { font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }

          .amm-body {
            margin-top: 18px;
            font-size: 14px;
            line-height: 1.6;
            color: var(--text);
            white-space: pre-wrap;
            word-break: break-word;
            background: var(--fill);
            border: 1px solid var(--glass-border);
            border-left: 3px solid var(--accent);
            border-radius: 8px;
            padding: 14px 16px;
          }

          .amm-ack {
            width: 100%;
            margin-top: 20px;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 13px;
            font-size: 15px;
            font-weight: 600;
            transition: background 0.15s;
          }
          .amm-ack:hover { background: var(--accent-deep); }
        `}</style>
      </div>
    </div>
  );
}

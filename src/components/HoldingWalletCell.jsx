import { useState } from "react";

// Per-coin wallet-address slot. `address` is always null for now — the
// branch is where a real linked address will render once wallet linking
// exists. The button just shows a brief "Loading…" placeholder.
export default function HoldingWalletCell({ symbol }) {
  const [linking, setLinking] = useState(false);
  const address = null;

  function handleAdd() {
    setLinking(true);
    setTimeout(() => setLinking(false), 1500);
  }

  return (
    <>
      {address ? (
        <span className="hwc-address" title={address}>
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      ) : (
        <button
          type="button"
          className="hwc-add"
          onClick={handleAdd}
          disabled={linking}
          aria-label={`Add a wallet address for ${symbol}`}
        >
          {linking ? "Loading…" : "Add wallet"}
        </button>
      )}

      <style>{`
        .hwc-add {
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent);
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
          border-radius: 10px;
          padding: 7px 14px;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
        }
        .hwc-add:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.25);
          border-color: var(--accent);
        }
        .hwc-add:disabled { opacity: 0.6; cursor: default; }
        .hwc-address { font-size: 12.5px; color: var(--text-muted); }
      `}</style>
    </>
  );
}

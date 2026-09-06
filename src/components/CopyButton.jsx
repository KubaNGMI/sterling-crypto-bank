import { useState } from "react";

// Small "copy this value to the clipboard" affordance. Always reads "Copy",
// briefly "Copied" after a successful copy. `label` only names the value for
// screen readers.
export default function CopyButton({ value, label }) {
  const [done, setDone] = useState(false);

  function copy() {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <>
      <button
        type="button"
        className="copy-btn"
        onClick={copy}
        aria-label={`Copy ${label || value}`}
      >
        {done ? "Copied" : "Copy"}
      </button>

      <style>{`
        .copy-btn {
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 4px 10px;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
        }
        .copy-btn:hover { color: var(--text); border-color: var(--accent); }
      `}</style>
    </>
  );
}

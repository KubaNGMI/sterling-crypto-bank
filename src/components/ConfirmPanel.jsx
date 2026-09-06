// The review beat before a money action commits. Replaces the primary button
// with a short summary and a two-choice confirm — a financial decision gets a
// second look, not a single click.
export default function ConfirmPanel({
  title,
  rows = [],
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onBack,
}) {
  return (
    <div className="confirm-panel settle">
      <p className="confirm-panel__title">{title}</p>
      <dl className="confirm-panel__rows">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="confirm-panel__actions">
        <button
          type="button"
          className="confirm-panel__back"
          onClick={onBack}
          disabled={busy}
        >
          Back
        </button>
        <button
          type="button"
          className="confirm-panel__confirm"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Processing…" : confirmLabel}
        </button>
      </div>

      <style>{`
        .confirm-panel {
          margin-top: 24px;
          padding: 16px;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          background: var(--fill-subtle);
        }
        .confirm-panel__title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .confirm-panel__rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .confirm-panel__rows > div {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          font-size: 13px;
        }
        .confirm-panel__rows dt { color: var(--text-muted); }
        .confirm-panel__rows dd { font-weight: 600; text-align: right; word-break: break-word; }
        .confirm-panel__actions { display: flex; gap: 10px; }
        .confirm-panel__back {
          flex: 1;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px;
          transition: color 0.15s, border-color 0.15s;
        }
        .confirm-panel__back:hover:not(:disabled) {
          color: var(--text);
          border-color: var(--accent);
        }
        .confirm-panel__confirm {
          flex: 2;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: var(--accent);
          border: none;
          border-radius: 12px;
          padding: 12px;
          transition: background 0.15s;
        }
        .confirm-panel__confirm:hover:not(:disabled) { background: var(--accent-deep); }
        .confirm-panel__back:disabled,
        .confirm-panel__confirm:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

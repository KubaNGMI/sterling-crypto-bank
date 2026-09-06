import Money from "./Money";

export default function SummaryCards({ totals }) {
  const items = [
    { label: "Total Deposited", value: totals.deposited, color: "var(--green)" },
    { label: "Total Spent", value: totals.spent, color: "var(--red)" },
    { label: "Total Received", value: totals.received, color: "var(--accent)" },
    {
      label: "Net Flow",
      value: totals.net,
      color: totals.net >= 0 ? "var(--green)" : "var(--red)",
      isNet: true,
    },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <div
          className={"card summary-card" + (item.isNet ? " summary-card-net" : "")}
          key={item.label}
        >
          <p className="summary-label">{item.label}</p>
          <p className="summary-value" style={{ color: item.color }}>
            <Money value={item.value} />
          </p>
        </div>
      ))}

      <style>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }
        .summary-card { padding: 22px 24px; }
        .summary-label { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
        .summary-value { font-size: 22px; font-weight: 700; }

        /* Net Flow is the summary of the other three cards — a quiet accent
           edge and a slightly larger figure mark it as the total, not just
           a fourth peer stat. */
        .summary-card-net {
          border-color: var(--glass-border);
          box-shadow:
            inset 3px 0 0 var(--accent),
            0 8px 32px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 var(--glass-highlight);
        }
        .summary-card-net .summary-label { color: var(--text); }

        @media (max-width: 900px) {
          .summary-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
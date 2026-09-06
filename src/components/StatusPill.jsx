// Account-status pill — the badge pattern from DESIGN.md (15%-tint fill,
// matching text, 11.5px/700 uppercase, full pill), colored by status.
const TONE = {
  unverified: { bg: "var(--fill-hover)", fg: "var(--text-muted)" },
  pending: { bg: "var(--wash-amber-strong)", fg: "var(--orange)" },
  verified: { bg: "var(--wash-green-strong)", fg: "var(--green)" },
  rejected: { bg: "var(--wash-red-strong)", fg: "var(--red)" },
  suspended: { bg: "var(--wash-red-strong)", fg: "var(--red)" },
};

export default function StatusPill({ status }) {
  const key = status || "unverified";
  const tone = TONE[key] || TONE.unverified;
  return (
    <span
      className="status-pill"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {key}
      <style>{`
        .status-pill {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}

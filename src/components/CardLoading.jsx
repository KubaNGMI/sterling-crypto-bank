/**
 * Shimmer placeholder for a card that's still fetching. Keeps loading states
 * visually consistent with EmptyState instead of an orphan "Loading…" line.
 */
export default function CardLoading({ label = "Loading…", rows = 3 }) {
  return (
    <div className="card-loading" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="card-loading__row" key={i} />
      ))}
      <style>{`
        .card-loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          padding: 18px 0;
          min-height: 216px;
        }
        .card-loading__row {
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            var(--fill-subtle) 25%,
            rgba(255, 255, 255, 0.07) 37%,
            var(--fill-subtle) 63%
          );
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
        }
        .card-loading__row:nth-child(1) { width: 70%; }
        .card-loading__row:nth-child(2) { width: 100%; }
        .card-loading__row:nth-child(3) { width: 85%; }
        .card-loading__row:nth-child(4) { width: 60%; }
        .card-loading__row:nth-child(5) { width: 90%; }
        @media (prefers-reduced-motion: reduce) {
          .card-loading__row { animation: none; }
        }
      `}</style>
    </div>
  );
}

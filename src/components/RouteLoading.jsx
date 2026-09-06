// Suspense fallback for lazy-loaded route chunks — shown only while a
// page's JS is still downloading (near-instant after the first visit).
export default function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-label="Loading">
      <span className="route-loading__spinner" aria-hidden="true" />
      <style>{`
        .route-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 240px;
        }
        .route-loading__spinner {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2.5px solid var(--glass-border);
          border-top-color: var(--accent);
          animation: route-spin 0.7s linear infinite;
        }
        @keyframes route-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-loading__spinner { animation: none; }
        }
      `}</style>
    </div>
  );
}

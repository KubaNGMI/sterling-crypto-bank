import { Link } from "react-router-dom";
import { useAccountStatus } from "../hooks/useAccountStatus";
import { useIsAdmin } from "../hooks/useIsAdmin";
import CardLoading from "./CardLoading";

// Wraps a feature card. Renders its children once the account is verified
// (admins always pass); otherwise swaps in a lock panel in the same card slot.
//
// Fails closed: while the account status is still loading the feature stays
// covered, so an unverified user never gets a working panel in the gap before
// their profile resolves.
export default function VerifyGate({ children, feature = "this feature", className = "" }) {
  const { status, verified, loading } = useAccountStatus();
  const isAdmin = useIsAdmin();

  if (isAdmin) return children;

  if (loading) {
    return (
      <div className={"card verify-gate " + className}>
        <CardLoading label="Checking your account" rows={3} />
      </div>
    );
  }

  if (verified) return children;

  const inReview = status === "pending";

  return (
    <div className={"card verify-gate " + className}>
      <span className="verify-gate__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
        </svg>
      </span>
      <p className="verify-gate__title">
        {inReview ? "Verification in review" : "Verification required"}
      </p>
      <p className="verify-gate__hint">
        {inReview
          ? `Your documents are being reviewed. ${feature} unlocks once you're verified.`
          : `Verify your identity to use ${feature}.`}
      </p>
      {!inReview && (
        <Link to="/profile" className="verify-gate__action">
          Go to verification
        </Link>
      )}

      <style>{`
        .verify-gate {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          gap: 6px;
          min-height: 300px;
        }
        .verify-gate__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-bottom: 6px;
          border-radius: 12px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
        }
        .verify-gate__icon svg { width: 20px; height: 20px; display: block; }
        .verify-gate__title { font-size: 14px; font-weight: 600; }
        .verify-gate__hint {
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--text-muted);
          max-width: 34ch;
        }
        .verify-gate__action {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-text);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 9px 18px;
          transition: border-color 0.15s, background 0.15s;
        }
        .verify-gate__action:hover {
          border-color: var(--accent);
          background: var(--fill);
        }
      `}</style>
    </div>
  );
}

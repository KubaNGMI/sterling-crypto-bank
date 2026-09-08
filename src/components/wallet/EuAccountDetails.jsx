import { useBankAccounts } from "../../hooks/useBankAccounts";
import { EU_ACCOUNT } from "../../config/euAccount";
import CopyButton from "../CopyButton";

// Shown once the user has linked at least one bank account — the EUR
// virtual-account details they can receive funds into. Self-gating: renders
// nothing until there's a linked account.
export default function EuAccountDetails() {
  const { accounts, loading } = useBankAccounts();
  if (loading || accounts.length === 0) return null;

  const rows = [
    { label: "Account holder", value: EU_ACCOUNT.holder, copy: true },
    { label: "Bank", value: EU_ACCOUNT.bank },
    { label: "IBAN", value: EU_ACCOUNT.iban, copy: true, mono: true },
    { label: "BIC / SWIFT", value: EU_ACCOUNT.bic, copy: true, mono: true },
    { label: "Currency", value: EU_ACCOUNT.currency },
  ];

  return (
    <div className="card eu-account-card">
      <p className="label">Your Sterling EU account</p>
      <p className="eu-sub">
        Receive EUR straight into this account. Details are the same every time —
        share them with anyone paying you.
      </p>

      <dl className="eu-rows">
        {rows.map((r) => (
          <div className="eu-row" key={r.label}>
            <dt>{r.label}</dt>
            <dd>
              <span className={"eu-value" + (r.mono ? " eu-value--mono" : "")}>
                {r.value}
              </span>
              {r.copy && <CopyButton value={r.value} label={r.label} />}
            </dd>
          </div>
        ))}
      </dl>

      <style>{`
        .eu-account-card { margin-bottom: 24px; }
        .eu-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .eu-rows { display: flex; flex-direction: column; gap: 14px; }
        .eu-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
        }
        .eu-row dt { font-size: 12.5px; color: var(--text-muted); flex-shrink: 0; }
        .eu-row dd {
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: right;
        }
        .eu-value { font-size: 14px; font-weight: 500; word-break: break-word; }
        .eu-value--mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.02em;
        }

        @media (max-width: 560px) {
          .eu-row { flex-direction: column; align-items: flex-start; gap: 4px; }
          .eu-row dd { text-align: left; }
        }
      `}</style>
    </div>
  );
}

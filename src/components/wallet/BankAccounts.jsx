import { useState } from "react";
import { Link } from "react-router-dom";
import { useBankAccounts } from "../../hooks/useBankAccounts";
import { BANK_REGIONS, maskAccountNumber } from "../../utils/bank";
import Flag from "../Flag";
import StatusPill from "../StatusPill";
import CardLoading from "../CardLoading";
import EmptyState from "../EmptyState";
import { emptyIcons } from "../emptyIcons";

export default function BankAccounts() {
  const { accounts, loading, error, removeAccount } = useBankAccounts();
  const [removingId, setRemovingId] = useState(null);
  const [rowError, setRowError] = useState(null);

  async function handleRemove(acct) {
    setRowError(null);
    setRemovingId(acct.id);
    try {
      await removeAccount(acct);
    } catch (err) {
      setRowError({ id: acct.id, text: err.message });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="card bank-accounts-card">
      <div className="ba-head">
        <p className="label">Bank accounts</p>
        <Link to="/wallet/bank/new" className="ba-add">Link a bank account</Link>
      </div>

      {error ? (
        <p className="ba-error">
          Couldn't load bank accounts: {error}
          {error.toLowerCase().includes("bank_accounts") &&
            " — the bank_accounts table hasn't been created yet."}
        </p>
      ) : loading ? (
        <CardLoading label="Loading bank accounts" rows={3} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={emptyIcons.bank}
          title="No bank accounts linked"
          hint="Link an Australian or New Zealand account to withdraw your balance to your bank."
          action={{ label: "Link a bank account", to: "/wallet/bank/new" }}
        />
      ) : (
        <ul className="ba-list">
          {accounts.map((a) => {
            const region = BANK_REGIONS[a.region];
            return (
              <li className="ba-row" key={a.id}>
                <Flag iso2={region?.iso2 ?? a.region} className="ba-flag" />
                <div className="ba-main">
                  <p className="ba-name">{a.account_name}</p>
                  <p className="ba-sub">
                    {region?.label ?? a.region}
                    {a.bsb ? ` · BSB ${a.bsb}` : ""} · {maskAccountNumber(a.account_number)}
                  </p>
                  {rowError?.id === a.id && <p className="ba-row-error">{rowError.text}</p>}
                </div>
                <StatusPill status={a.status} />
                <button
                  className="ba-remove"
                  onClick={() => handleRemove(a)}
                  disabled={removingId === a.id}
                >
                  {removingId === a.id ? "…" : "Remove"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <style>{`
        .ba-head {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-bottom: 6px;
        }
        .label { margin-bottom: 0; }
        .ba-add {
          font-size: 13px; font-weight: 600; color: var(--accent-text);
          border: 1px solid var(--glass-border); border-radius: 10px;
          padding: 7px 14px; white-space: nowrap;
          transition: border-color 0.15s, background 0.15s;
        }
        .ba-add:hover { border-color: var(--accent); background: var(--fill); }

        .ba-error {
          margin-top: 12px; font-size: 13px; color: var(--red);
          background: var(--wash-red); border: 1px solid var(--wash-red-line);
          border-radius: 8px; padding: 8px 12px;
        }

        .ba-list { margin-top: 16px; display: flex; flex-direction: column; gap: 4px; }
        .ba-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 4px;
          border-bottom: 1px solid var(--glass-border);
        }
        .ba-row:last-child { border-bottom: none; }
        .ba-flag { width: 24px; height: 17px; flex-shrink: 0; }
        .ba-main { flex: 1; min-width: 0; }
        .ba-name { font-size: 14px; font-weight: 600; }
        .ba-sub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        .ba-row-error { font-size: 12.5px; color: var(--red); margin-top: 4px; }
        .ba-remove {
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: none;
          border: 1px solid var(--glass-border); border-radius: 10px;
          padding: 6px 12px; flex-shrink: 0;
          transition: color 0.15s, border-color 0.15s;
        }
        .ba-remove:hover { color: var(--red); border-color: var(--red); }
        .ba-remove:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

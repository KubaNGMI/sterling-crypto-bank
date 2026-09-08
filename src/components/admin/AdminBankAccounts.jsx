import { useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useAdminBankAccounts } from "../../hooks/useAdminBankAccounts";
import { BANK_REGIONS, maskAccountNumber } from "../../utils/bank";
import { personLabel } from "../../utils/identity";
import StatusPill from "../StatusPill";
import CardLoading from "../CardLoading";
import EmptyState from "../EmptyState";
import { emptyIcons } from "../emptyIcons";

export default function AdminBankAccounts({ users }) {
  const { accounts, loading, error, refetch, setStatus } = useAdminBankAccounts();
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  async function apply(id, status) {
    setRowError(null);
    setBusyId(id + status);
    try {
      await setStatus(id, status);
    } catch (err) {
      setRowError({ id, text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  async function openStatement(path) {
    const { data, error: sErr } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 60);
    if (!sErr && data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="card admin-card">
      <div className="admin-card__head">
        <p className="label">
          Linked bank accounts{accounts.length ? ` · ${accounts.length}` : ""}
        </p>
        <button className="ghost-btn" onClick={refetch} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="admin-error">
          Couldn't load bank accounts: {error}
          {error.toLowerCase().includes("bank_accounts") &&
            " — the bank_accounts table hasn't been created yet."}
        </p>
      )}

      {loading ? (
        <CardLoading label="Loading bank accounts" rows={5} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={emptyIcons.bank}
          title="No bank accounts submitted"
          hint="Accounts users link appear here for review."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Account holder</th>
                <th>Region</th>
                <th>Details</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const region = BANK_REGIONS[a.region];
                return (
                  <tr key={a.id}>
                    <td className="strong">{personLabel(usersById[a.user_id])}</td>
                    <td className="muted">
                      {region?.label ?? a.region} · {a.currency}
                    </td>
                    <td className="muted">
                      {a.account_name}
                      <br />
                      {a.bsb ? `BSB ${a.bsb} · ` : ""}
                      {maskAccountNumber(a.account_number)}
                    </td>
                    <td><StatusPill status={a.status} /></td>
                    <td className="row-actions">
                      {a.statement_path && (
                        <button
                          className="ghost-btn"
                          onClick={() => openStatement(a.statement_path)}
                        >
                          Statement
                        </button>
                      )}
                      {a.status !== "verified" && (
                        <button
                          className="ghost-btn ghost-btn--accent"
                          onClick={() => apply(a.id, "verified")}
                          disabled={busyId === a.id + "verified"}
                        >
                          {busyId === a.id + "verified" ? "…" : "Verify"}
                        </button>
                      )}
                      {a.status !== "rejected" && (
                        <button
                          className="ghost-btn"
                          onClick={() => apply(a.id, "rejected")}
                          disabled={busyId === a.id + "rejected"}
                        >
                          {busyId === a.id + "rejected" ? "…" : "Reject"}
                        </button>
                      )}
                      {rowError?.id === a.id && (
                        <span className="row-error">{rowError.text}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-card__head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 4px;
        }
        .label { margin-bottom: 0; }
        .admin-error {
          margin: 12px 0; font-size: 13px; color: var(--red);
          background: var(--wash-red); border: 1px solid var(--wash-red-line);
          border-radius: 8px; padding: 8px 12px;
        }

        .admin-table-wrap { overflow-x: auto; margin-top: 12px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table thead th {
          text-align: left; font-size: 12.5px; color: var(--text-muted);
          font-weight: 500; padding: 0 14px 12px 0;
          border-bottom: 1px solid var(--border); white-space: nowrap;
        }
        .admin-table tbody td {
          padding: 14px 14px 14px 0; font-size: 14px;
          border-bottom: 1px solid var(--glass-border); vertical-align: top;
        }
        .admin-table tbody tr:last-child td { border-bottom: none; }
        .admin-table .strong { font-weight: 600; }
        .admin-table .muted { color: var(--text-muted); }

        .row-actions {
          display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
          justify-content: flex-end;
        }
        .row-error { font-size: 12.5px; color: var(--red); width: 100%; text-align: right; }

        .ghost-btn {
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: none;
          border: 1px solid var(--glass-border); border-radius: 10px;
          padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ghost-btn:hover { color: var(--text); border-color: var(--accent); }
        .ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ghost-btn--accent { color: var(--accent-text); }
      `}</style>
    </div>
  );
}

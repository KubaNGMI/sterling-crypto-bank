import { useState } from "react";
import { fullName } from "../../utils/identity";
import CardLoading from "../CardLoading";
import EmptyState from "../EmptyState";
import { emptyIcons } from "../emptyIcons";
import StatusPill from "../StatusPill";
import UserDetailDrawer from "./UserDetailDrawer";

const RANGE_LABELS = {
  under_10k: "< $10k",
  "10k_50k": "$10k–50k",
  "50k_250k": "$50k–250k",
  "250k_1m": "$250k–1M",
  over_1m: "> $1M",
};

const displayName = (u) => fullName(u) || "Unnamed";

export default function AdminUsers({
  users,
  loading,
  error,
  onRefetch,
  onUpdateStatus,
  onUpdateDocReview,
}) {
  const [openUser, setOpenUser] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);

  async function quickVerify(user) {
    setRowError(null);
    setBusyId(user.id);
    try {
      await onUpdateStatus(user.id, "verified");
    } catch (err) {
      setRowError({ id: user.id, text: err.message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card admin-card">
      <div className="admin-card__head">
        <p className="label">All accounts{users.length ? ` · ${users.length}` : ""}</p>
        <button className="ghost-btn" onClick={onRefetch} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <p className="admin-error">Couldn't load accounts: {error}</p>}

      {loading ? (
        <CardLoading label="Loading accounts" rows={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={emptyIcons.receipt}
          title="No accounts yet"
          hint="Accounts appear here as people sign up."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Range</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} onClick={() => setOpenUser(u)}>
                  <td className="strong">{displayName(u)}</td>
                  <td className="muted email-cell" title={u.email || ""}>{u.email || "—"}</td>
                  <td className="muted">{u.country_of_residence || u.citizenship || "—"}</td>
                  <td className="muted">{RANGE_LABELS[u.funds_range] || "—"}</td>
                  <td><StatusPill status={u.account_status} /></td>
                  <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                    {u.account_status !== "verified" && (
                      <button
                        className="ghost-btn ghost-btn--accent"
                        onClick={() => quickVerify(u)}
                        disabled={busyId === u.id}
                      >
                        {busyId === u.id ? "…" : "Verify"}
                      </button>
                    )}
                    <button className="ghost-btn" onClick={() => setOpenUser(u)}>
                      Details
                    </button>
                    {rowError?.id === u.id && (
                      <span className="row-error">{rowError.text}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openUser && (
        <UserDetailDrawer
          user={users.find((u) => u.id === openUser.id) || openUser}
          onClose={() => setOpenUser(null)}
          onUpdateStatus={onUpdateStatus}
          onUpdateDocReview={onUpdateDocReview}
        />
      )}

      <style>{`
        .admin-card__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .label { margin-bottom: 0; }
        .admin-error {
          margin: 12px 0;
          font-size: 13px;
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .admin-table-wrap { overflow-x: auto; margin-top: 12px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table thead th {
          text-align: left;
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 500;
          padding: 0 14px 12px 0;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .admin-table tbody td {
          padding: 14px 14px 14px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--glass-border);
          white-space: nowrap;
        }
        .admin-table tbody tr { cursor: pointer; transition: background 0.15s; }
        .admin-table tbody tr:hover { background: var(--fill-subtle); }
        .admin-table tbody tr:last-child td { border-bottom: none; }
        /* One long address was widening the whole table to ~1000px, which the
           wrapper then makes you swipe through on a phone. Capping the two
           free-text columns keeps the table near the width its data actually
           needs. Same treatment the ledger already gives its account column. */
        .admin-table .strong {
          font-weight: 600;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-table .muted { color: var(--text-muted); }
        .admin-table td.email-cell {
          /* 220px fits an ordinary address outright; only genuinely long ones
             clip, and those keep the full value in a title tooltip. */
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-end;
        }
        .row-error { font-size: 12.5px; color: var(--red); }

        .ghost-btn {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .ghost-btn:hover { color: var(--text); border-color: var(--accent); }
        .ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ghost-btn--accent { color: var(--accent-text); }
      `}</style>
    </div>
  );
}

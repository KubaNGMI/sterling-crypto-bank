import { formatUsd } from "../utils/format";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";
import CardLoading from "./CardLoading";

export default function TransactionHistory({ transactions, loading, onSelectTransaction }) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="card history-card" id="transaction-history">
      <p className="label">Transaction History</p>

      {loading ? (
        <CardLoading label="Loading transactions" rows={4} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={emptyIcons.receipt}
          title="No transactions yet"
          hint="Deposits, trades, and withdrawals will appear here as you use your wallet."
        />
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Coin</th>
              <th>Amount</th>
              <th>Status</th>
              <th aria-label="Details" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id}>
                <td>
                  {new Date(t.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <span className={"type-badge type-" + t.type}>
                    {String(t.type).replace("_", " ")}
                  </span>
                </td>
                <td>{t.coin_symbol || "FIAT"}</td>
                <td className={Number(t.usd_amount) >= 0 ? "amount-positive" : "amount-negative"}>
                  {Number(t.usd_amount) >= 0 ? "+" : "-"}
                  {formatUsd(Math.abs(Number(t.usd_amount)))}
                </td>
                <td>
                  {t.status === "pending" ? (
                    <span className="pending-badge">Pending</span>
                  ) : (
                    <span className="completed-badge">Completed</span>
                  )}
                </td>
                <td className="history-details-cell">
                  <button
                    type="button"
                    className="history-details-btn"
                    onClick={() => onSelectTransaction?.(t)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .history-empty {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 12px;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        .history-table thead th {
          text-align: left;
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 500;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--glass-border);
        }
        .history-table tbody td {
          padding: 14px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--glass-border);
        }
        .history-table tbody tr:last-child td { border-bottom: none; }

        .type-badge {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .type-buy { background: rgba(99, 102, 241, 0.15); color: var(--accent-text); }
        .type-sell { background: var(--wash-red-strong); color: var(--red); }
        .type-deposit { background: var(--wash-green-strong); color: var(--green); }
        .type-withdrawal { background: var(--wash-amber-strong); color: var(--orange); }
        .type-transfer_in { background: var(--wash-green-strong); color: var(--green); }
        .type-transfer_out { background: var(--wash-amber-strong); color: var(--orange); }
        .type-adjustment { background: var(--fill-hover); color: var(--text-muted); }

        .pending-badge,
        .completed-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .pending-badge {
          background: var(--wash-amber-strong);
          color: var(--orange);
        }
        .completed-badge {
          background: var(--wash-green-strong);
          color: var(--green);
        }

        .amount-positive { color: var(--green); font-weight: 600; }
        .amount-negative { color: var(--red); font-weight: 600; }

        .history-details-cell { text-align: right; }
        .history-details-btn {
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 6px 12px;
          transition: color 0.15s, border-color 0.15s;
        }
        .history-details-btn:hover { color: var(--text); border-color: var(--accent); }
      `}</style>
    </div>
  );
}
import { useMemo, useState } from "react";
import { COINS } from "../../coins";
import { useAdminLedger } from "../../hooks/useAdminLedger";
import { personLabel } from "../../utils/identity";
import { formatUsd, formatCoin } from "../../utils/format";
import CardLoading from "../CardLoading";
import EmptyState from "../EmptyState";
import { emptyIcons } from "../emptyIcons";
import ConfirmPanel from "../ConfirmPanel";

const OPS = [
  { key: "deposit", label: "Deposit" },
  { key: "withdraw", label: "Withdraw" },
  { key: "transfer", label: "Transfer" },
  { key: "coin", label: "Coin adjust" },
];

const TYPE_TONE = {
  deposit: "var(--green)",
  sell: "var(--green)",
  transfer_in: "var(--green)",
  withdrawal: "var(--red)",
  buy: "var(--accent)",
  transfer_out: "var(--orange)",
  adjustment: "var(--text-muted)",
};

const money = (n) => formatUsd(Math.abs(Number(n)));

export default function AdminLedger({ users, usersLoading }) {
  const {
    transactions,
    loading,
    error,
    deposit,
    withdraw,
    transfer,
    adjustCoin,
    reverse,
    confirm,
  } = useAdminLedger();

  const [op, setOp] = useState("deposit");
  const [userId, setUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [coin, setCoin] = useState("BTC");
  const [direction, setDirection] = useState("credit");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  function resetForm() {
    setAmount("");
    setNote("");
    setToUserId("");
    setPending(false);
  }

  const num = parseFloat(amount);

  function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!userId) return setFeedback({ type: "error", text: "Pick an account." });
    if (!num || num <= 0)
      return setFeedback({ type: "error", text: "Enter an amount greater than zero." });
    if (op === "transfer" && !toUserId)
      return setFeedback({ type: "error", text: "Pick a recipient account." });
    if (op === "transfer" && toUserId === userId)
      return setFeedback({ type: "error", text: "Sender and recipient must differ." });

    setConfirming(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      if (op === "deposit") await deposit(userId, num, note, pending);
      else if (op === "withdraw") await withdraw(userId, num, note, pending);
      else if (op === "transfer") await transfer(userId, toUserId, num, note, pending);
      else if (op === "coin")
        await adjustCoin(userId, coin, direction === "credit" ? num : -num, note, pending);

      setConfirming(false);
      setFeedback({ type: "success", text: "Ledger entry posted." });
      resetForm();
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const confirmRows = () => {
    const acct = personLabel(usersById[userId]);
    const rows = (() => {
      if (op === "transfer") {
        return [
          { label: "From", value: acct },
          { label: "To", value: personLabel(usersById[toUserId]) },
          { label: "Amount", value: money(num) },
        ];
      }
      if (op === "coin") {
        return [
          { label: "Account", value: acct },
          { label: direction === "credit" ? "Credit" : "Debit", value: `${num} ${coin}` },
        ];
      }
      return [
        { label: "Account", value: acct },
        { label: op === "deposit" ? "Deposit" : "Withdraw", value: money(num) },
      ];
    })();
    return pending
      ? [...rows, { label: "Status", value: "Pending — won't count until confirmed" }]
      : rows;
  };

  async function handleReverse(tx) {
    setBusyId(tx.id);
    try {
      await reverse(tx);
    } catch {
      /* surfaced via the list error path on next fetch */
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmTx(tx) {
    setBusyId(tx.id);
    try {
      await confirm(tx);
    } catch {
      /* surfaced via the list error path on next fetch */
    } finally {
      setBusyId(null);
    }
  }

  const isCoin = op === "coin";
  const isTransfer = op === "transfer";

  return (
    <div className="ledger">
      <div className="card ledger__form-card">
        <p className="label">New manual entry</p>

        <div className="op-switch" role="tablist">
          {OPS.map((o) => (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={op === o.key}
              className={"op-choice" + (op === o.key ? " active" : "")}
              disabled={confirming}
              onClick={() => {
                setOp(o.key);
                setFeedback(null);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        <form className="ledger__form" onSubmit={handleSubmit}>
         <fieldset className="ledger__fields" disabled={confirming}>
          <label className="field">
            <span>{isTransfer ? "From account" : "Account"}</span>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} disabled={usersLoading}>
              <option value="">{usersLoading ? "Loading…" : "Select account"}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{personLabel(u)}</option>
              ))}
            </select>
          </label>

          {isTransfer && (
            <label className="field">
              <span>To account</span>
              <select value={toUserId} onChange={(e) => setToUserId(e.target.value)}>
                <option value="">Select recipient</option>
                {users
                  .filter((u) => u.id !== userId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>{personLabel(u)}</option>
                  ))}
              </select>
            </label>
          )}

          {isCoin && (
            <div className="field-row">
              <label className="field">
                <span>Coin</span>
                <select value={coin} onChange={(e) => setCoin(e.target.value)}>
                  {Object.keys(COINS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Direction</span>
                <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="credit">Credit (add)</option>
                  <option value="debit">Debit (remove)</option>
                </select>
              </label>
            </div>
          )}

          <label className="field">
            <span>{isCoin ? `Amount (${coin})` : "Amount (USD)"}</span>
            <input
              type="number"
              step={isCoin ? "0.00000001" : "0.01"}
              min="0"
              inputMode="decimal"
              placeholder={isCoin ? "0.00000000" : "0.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Note (optional)</span>
            <input
              type="text"
              placeholder="Reason / reference"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <label className="field-checkbox">
            <input
              type="checkbox"
              checked={pending}
              onChange={(e) => setPending(e.target.checked)}
            />
            <span>
              Mark as pending
              <small>Won't count toward balance/holdings until confirmed.</small>
            </span>
          </label>
         </fieldset>

          {!confirming && (
            <button type="submit" className="ledger__submit">
              Review entry
            </button>
          )}

          {feedback && (
            <p className={feedback.type === "success" ? "fb-success" : "fb-error"}>
              {feedback.text}
            </p>
          )}

          {confirming && (
            <ConfirmPanel
              title="Confirm this ledger entry"
              rows={confirmRows()}
              confirmLabel="Post entry"
              busy={submitting}
              onConfirm={handleConfirm}
              onBack={() => setConfirming(false)}
            />
          )}
        </form>
      </div>

      <div className="card ledger__activity-card">
        <p className="label">Recent activity{transactions.length ? ` · ${transactions.length}` : ""}</p>

        {error && <p className="fb-error">Couldn't load activity: {error}</p>}

        {loading ? (
          <CardLoading label="Loading activity" rows={6} />
        ) : transactions.length === 0 ? (
          <EmptyState icon={emptyIcons.receipt} title="No entries yet" hint="Posted entries show up here." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Date</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="strong">{personLabel(usersById[t.user_id])}</td>
                    {/* Pending rides in the Type cell rather than a column of
                        its own: a settled row left that column empty, and the
                        header alone cost ~60px the table couldn't spare. */}
                    <td>
                      <span className="type-cell">
                        <span className="type-tag" style={{ color: TYPE_TONE[t.type] || "var(--text-muted)" }}>
                          {t.type.replace("_", " ")}
                        </span>
                        {t.status === "pending" && (
                          <span className="pending-badge">Pending</span>
                        )}
                      </span>
                    </td>
                    <td className="muted">
                      {t.coin_symbol
                        ? `${Number(t.coin_amount) >= 0 ? "+" : "−"}${formatCoin(Math.abs(Number(t.coin_amount)))} ${t.coin_symbol}`
                        : `${Number(t.usd_amount) >= 0 ? "+" : "−"}${money(t.usd_amount)}`}
                    </td>
                    <td className="muted note-cell">{t.note || "—"}</td>
                    <td className="muted">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </td>
                    <td className="row-actions">
                      {t.status === "pending" && (
                        <button
                          className="ghost-btn"
                          onClick={() => handleConfirmTx(t)}
                          disabled={busyId === t.id}
                        >
                          {busyId === t.id ? "…" : "Confirm"}
                        </button>
                      )}
                      <button
                        className="ghost-btn"
                        onClick={() => handleReverse(t)}
                        disabled={busyId === t.id}
                      >
                        {busyId === t.id ? "…" : t.status === "pending" ? "Reject" : "Reverse"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .ledger {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: start;
        }
        /* A grid item defaults to min-width:auto, so the nowrap table below
           stretches this column past the card instead of scrolling inside it
           — which pushed the row actions off the right edge. */
        .ledger__activity-card { min-width: 0; }
        .label { margin-bottom: 16px; }

        .op-switch {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 4px;
          margin-bottom: 16px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
        }
        .op-choice {
          flex: 1;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 600;
          padding: 8px 6px;
          border-radius: 8px;
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
        }
        .op-choice:hover { color: var(--text); }
        .op-choice.active { color: #fff; background: var(--accent); }

        .ledger__form { display: flex; flex-direction: column; gap: 12px; }
        .ledger__fields {
          border: none;
          margin: 0;
          padding: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .field-row { display: flex; gap: 12px; }
        .field-row .field { flex: 1; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field > span { font-size: 12.5px; color: var(--text-muted); }
        .field input,
        .field select {
          width: 100%;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 14px;
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field input:focus,
        .field select:focus { border-color: var(--accent); }
        .field select { appearance: none; cursor: pointer; }
        .field input::-webkit-outer-spin-button,
        .field input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        .field-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--text);
          cursor: pointer;
        }
        .field-checkbox input { margin-top: 2px; accent-color: var(--accent); }
        .field-checkbox small {
          display: block;
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 400;
        }

        .ledger__submit {
          margin-top: 4px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .ledger__submit:hover { background: var(--accent-deep); }
        .ledger__submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .fb-success, .fb-error {
          font-size: 13px;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .fb-success {
          color: var(--green);
          background: var(--wash-green);
          border: 1px solid var(--wash-green-line);
        }
        .fb-error {
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
        }

        .admin-table-wrap { overflow-x: auto; margin-top: 12px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table thead th {
          text-align: left;
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 500;
          padding: 0 10px 12px 0;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .admin-table tbody td {
          padding: 13px 10px 13px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--glass-border);
          white-space: nowrap;
        }
        .admin-table tbody tr:last-child td { border-bottom: none; }
        .admin-table .muted { color: var(--text-muted); }
        /* Account falls back to the email when there's no name, and a long
           address would otherwise widen the whole table. */
        .admin-table .strong {
          font-weight: 600;
          max-width: 170px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .note-cell {
          max-width: 170px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .type-cell { display: inline-flex; align-items: center; gap: 8px; }
        .type-tag { font-weight: 600; text-transform: capitalize; }
        .pending-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--wash-amber-strong);
          color: var(--orange);
        }
        .row-actions { display: flex; gap: 8px; justify-content: flex-end; }

        .ghost-btn {
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          background: none;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 7px 14px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ghost-btn:hover { color: var(--text); border-color: var(--accent); }
        .ghost-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Side by side, the activity table only fits above ~1500px. Below
           that the form stacks above it and the table gets the full width,
           which carries it down to ~1100 before it has to scroll. */
        @media (max-width: 1500px) {
          .ledger { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

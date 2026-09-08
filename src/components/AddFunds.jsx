import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { formatUsd } from "../utils/format";
import { withMinDuration } from "../utils/withMinDuration";
import { scheduleUserNotification } from "../utils/notify";
import VerifyGate from "./VerifyGate";
import ConfirmPanel from "./ConfirmPanel";

export default function AddFunds({ onComplete }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const value = parseFloat(amount);

  function startReview(e) {
    e.preventDefault();
    setFeedback(null);
    if (!value || value <= 0) {
      return setFeedback({ type: "error", text: "Enter an amount greater than $0." });
    }
    if (!user) {
      return setFeedback({ type: "error", text: "You need to be logged in." });
    }
    setConfirming(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const { data, error } = await withMinDuration(() =>
        supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "deposit",
            coin_symbol: null,
            coin_amount: null,
            usd_amount: value,
          })
          .select("id")
          .single()
      );

      if (error) {
        setFeedback({ type: "error", text: error.message });
        return;
      }

      scheduleUserNotification({
        userId: user.id,
        transactionId: data?.id,
        title: "Deposit received",
        body: `+${formatUsd(value)}`,
      });

      setConfirming(false);
      setFeedback({
        type: "success",
        text: `Adding ${formatUsd(value)} to your balance — you'll get a notification once it's confirmed.`,
      });
      setAmount("");
      onComplete?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <VerifyGate feature="Add Funds" className="add-funds-card">
    <div className="card add-funds-card">
      <p className="label">Add Funds</p>
      <p className="add-funds-sub">Deposit cash into your wallet balance.</p>

      <form className="add-funds-form" onSubmit={startReview}>
        <label htmlFor="add-funds-amount" className="sr-only">Amount to add, in dollars</label>
        <div className="amount-input">
          <span className="dollar-sign">$</span>
          <input
            id="add-funds-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={confirming}
          />
        </div>
        {!confirming && (
          <button type="submit" className="add-funds-btn">
            Review
          </button>
        )}
      </form>

      {feedback && (
        <p className={feedback.type === "success" ? "feedback-success" : "feedback-error"}>
          {feedback.text}
        </p>
      )}

      {confirming && (
        <ConfirmPanel
          title="Review this deposit"
          rows={[{ label: "Add to balance", value: formatUsd(value) }]}
          confirmLabel="Confirm deposit"
          busy={submitting}
          onConfirm={handleConfirm}
          onBack={() => setConfirming(false)}
        />
      )}

      <style>{`
        .add-funds-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .add-funds-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
          margin-bottom: 16px;
        }
        .add-funds-form {
          display: flex;
          gap: 12px;
        }
        .amount-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 16px;
        }
        .amount-input:focus-within { border-color: var(--accent); }
        .dollar-sign { color: var(--text-muted); font-size: 14px; }
        .amount-input input {
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          width: 100%;
        }
        .amount-input input::-webkit-outer-spin-button,
        .amount-input input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .add-funds-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0 22px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .add-funds-btn:hover { background: var(--accent-deep); }
        .add-funds-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      `}</style>
    </div>
    </VerifyGate>
  );
}
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { formatUsd } from "../utils/format";
import { withMinDuration } from "../utils/withMinDuration";
import { scheduleUserNotification } from "../utils/notify";
import { FIRST_DEPOSIT_LIMIT, isFirstDeposit } from "../config/depositAddresses";
import VerifyGate from "./VerifyGate";
import DepositModal from "./DepositModal";

export default function AddFunds({ onComplete, transactions = [] }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const value = parseFloat(amount);
  const firstDeposit = isFirstDeposit(transactions);

  function startDeposit(e) {
    e.preventDefault();
    setFeedback(null);
    if (!user) {
      return setFeedback({ type: "error", text: "You need to be logged in." });
    }
    if (!value || value <= 0) {
      return setFeedback({ type: "error", text: "Enter an amount greater than $0." });
    }
    if (firstDeposit && value > FIRST_DEPOSIT_LIMIT) {
      return setFeedback({
        type: "error",
        text: `Your first deposit is capped at ${formatUsd(FIRST_DEPOSIT_LIMIT)}. Enter ${formatUsd(FIRST_DEPOSIT_LIMIT)} or less — the cap lifts once it clears.`,
      });
    }
    setChoosing(true);
  }

  // The row lands as `pending`: the user has told us a transfer is on its way,
  // and nothing is spendable until an admin confirms it arrived on-chain from
  // Admin → Ledger. This is what stops Add Funds from minting cash.
  //
  // The hash rides along in `note` — every deposit address is shared across
  // all users, so an incoming transfer cannot be attributed to a request by
  // address alone. The hash is what makes Confirm a lookup instead of a guess.
  // It is user-supplied and unverified: check it on-chain before confirming.
  async function handleConfirm(asset, txHash) {
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
            status: "pending",
            note: `Incoming ${asset.symbol} on ${asset.network} · tx ${txHash}`,
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
        title: "Deposit request received",
        body: `${formatUsd(value)} via ${asset.symbol} — awaiting confirmation`,
      });

      setChoosing(false);
      setFeedback({
        type: "success",
        text: `We're watching for your ${asset.symbol} transfer. ${formatUsd(value)} will be added to your balance once it confirms.`,
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
        <p className="add-funds-sub">
          Fund your balance by sending crypto. Choose an amount, then pick what
          you want to send.
        </p>

        <form className="add-funds-form" onSubmit={startDeposit}>
          <label htmlFor="add-funds-amount" className="sr-only">
            Amount to add, in dollars
          </label>
          <div className="amount-input">
            <span className="dollar-sign">$</span>
            <input
              id="add-funds-amount"
              type="number"
              step="0.01"
              min="0"
              max={firstDeposit ? FIRST_DEPOSIT_LIMIT : undefined}
              inputMode="decimal"
              placeholder="0.00"
              aria-describedby={firstDeposit ? "add-funds-cap" : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button type="submit" className="add-funds-btn">
            Continue
          </button>
        </form>

        {firstDeposit && (
          <p className="add-funds-cap" id="add-funds-cap">
            First deposit is capped at {formatUsd(FIRST_DEPOSIT_LIMIT)}.
          </p>
        )}

        <div aria-live="polite" aria-atomic="true">
          {feedback && (
            <p
              role={feedback.type === "error" ? "alert" : undefined}
              className={feedback.type === "success" ? "feedback-success" : "feedback-error"}
            >
              {feedback.text}
            </p>
          )}
        </div>

        {choosing && (
          <DepositModal
            amount={value}
            submitting={submitting}
            onConfirm={handleConfirm}
            onClose={() => !submitting && setChoosing(false)}
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
            min-height: 44px;
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
          .add-funds-cap {
            margin-top: 10px;
            font-size: 12.5px;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    </VerifyGate>
  );
}

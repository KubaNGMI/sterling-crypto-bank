import { useId, useState } from "react";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { COINS, coinPrice, isImageIcon } from "../coins";
import { formatUsd } from "../utils/format";
import { withMinDuration } from "../utils/withMinDuration";
import { scheduleUserNotification } from "../utils/notify";
import Select from "./Select";
import VerifyGate from "./VerifyGate";
import ConfirmPanel from "./ConfirmPanel";

// The coin picker is the shared Select in its compact, search-free variant —
// same keyboard handling, ARIA, and outside-click close as every other select
// in the app, rather than a second implementation of the same control.
function CoinSelect({ value, onChange, options, ariaLabel }) {
  return (
    <div className="coin-select-field">
      <Select
        searchable={false}
        ariaLabel={ariaLabel}
        value={value}
        onChange={onChange}
        options={options.map((sym) => ({
          value: sym,
          label: sym,
          icon: isImageIcon(COINS[sym].icon) ? (
            <img src={COINS[sym].icon} alt="" className="coin-select-icon" />
          ) : (
            <span className="coin-select-icon-text">{COINS[sym].icon}</span>
          ),
        }))}
      />
    </div>
  );
}

export default function TradePanel({ onTradeComplete, balance = 0, holdings = [] }) {
  const { user } = useAuth();
  const fieldId = useId();
  const [mode, setMode] = useState("buy");
  const [fromSymbol, setFromSymbol] = useState("USD");
  const [toSymbol, setToSymbol] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { prices, loading, error } = useCryptoPrices();

  const fromCoin = COINS[fromSymbol];
  const toCoin = COINS[toSymbol];
  const fromPrice = coinPrice(fromCoin, prices);
  const toPrice = coinPrice(toCoin, prices);

  // USD on either side fixes the direction; the Buy/Sell toggle only matters
  // for a coin↔coin swap.
  const usdSide = fromCoin.isCash ? "buy" : toCoin.isCash ? "sell" : null;
  const effectiveMode = usdSide ?? mode;

  const amountNum = parseFloat(fromAmount) || 0;
  const usdValue = fromPrice ? amountNum * fromPrice : 0;
  const toAmount = toPrice ? usdValue / toPrice : 0;

  const coinInvolved = effectiveMode === "buy" ? toSymbol : fromSymbol;
  const coinAmount = effectiveMode === "buy" ? toAmount : amountNum;

  function handleSwap() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  }

  const heldAmount = (symbol) =>
    holdings.find((h) => h.symbol === symbol)?.amount ?? 0;

  // Whatever sits on the "From" side is what gets spent: cash for a buy, the
  // coin itself for a sell or a coin↔coin swap. Returns an error string when
  // the user doesn't have it, otherwise null.
  function checkFunds() {
    if (fromCoin.isCash) {
      if (usdValue > balance) {
        return `Insufficient cash — you have ${formatUsd(balance)}, this trade needs ${formatUsd(usdValue)}.`;
      }
      return null;
    }
    const held = heldAmount(fromSymbol);
    if (amountNum > held) {
      return `Insufficient ${fromSymbol} — you have ${held.toFixed(6)}, this trade needs ${amountNum.toFixed(6)}.`;
    }
    return null;
  }

  // Step 1: validate, then move to the review beat — no order is placed here.
  function startReview() {
    setFeedback(null);
    if (!user) {
      return setFeedback({ type: "error", text: "You need to be logged in to trade." });
    }
    if (!usdValue || usdValue <= 0) {
      return setFeedback({ type: "error", text: "Enter an amount to trade." });
    }
    const shortfall = checkFunds();
    if (shortfall) {
      return setFeedback({ type: "error", text: shortfall });
    }
    setConfirming(true);
  }

  // Step 2: the trade is only written after the user confirms the review.
  async function handleTrade() {
    // Re-check here too — prices (and so the USD value) move while the review
    // panel is open, and the balance may have changed in another tab.
    const shortfall = checkFunds();
    if (shortfall) {
      setConfirming(false);
      setFeedback({ type: "error", text: shortfall });
      return;
    }

    setSubmitting(true);
    const signedAmount = effectiveMode === "buy" ? -usdValue : usdValue;

    try {
      const { data, error: insertError } = await withMinDuration(() =>
        supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: effectiveMode,
            coin_symbol: coinInvolved,
            coin_amount: coinAmount,
            usd_amount: signedAmount,
          })
          .select("id")
          .single()
      );

      if (insertError) {
        setFeedback({ type: "error", text: insertError.message });
        return;
      }

      scheduleUserNotification({
        userId: user.id,
        transactionId: data?.id,
        title: effectiveMode === "buy" ? "Buy confirmed" : "Sell confirmed",
        body: `${effectiveMode === "buy" ? "+" : "-"}${coinAmount.toFixed(6)} ${coinInvolved}`,
      });

      setConfirming(false);
      setFeedback({
        type: "success",
        text: `${effectiveMode === "buy" ? "Buying" : "Selling"} ${coinAmount.toFixed(6)} ${coinInvolved} — you'll get a notification once it's confirmed.`,
      });
      onTradeComplete?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <VerifyGate feature="trading" className="trade-card">
    <div className="card trade-card">
      <div className="toggle-row">
        <div className={"toggle-pill" + (effectiveMode === "sell" ? " slide-right" : "")} />
        <button
          className={"toggle-btn" + (effectiveMode === "buy" ? " active" : "")}
          disabled={!!usdSide}
          onClick={() => {
            setMode("buy");
            setFeedback(null);
          }}
        >
          Buy
        </button>
        <button
          className={"toggle-btn" + (effectiveMode === "sell" ? " active" : "")}
          disabled={!!usdSide}
          onClick={() => {
            setMode("sell");
            setFeedback(null);
          }}
        >
          Sell
        </button>
      </div>

      <div className="input-group">
        <label htmlFor={fieldId + "-from"}>From</label>
        <div className="coin-input">
          <CoinSelect
            value={fromSymbol}
            onChange={setFromSymbol}
            options={Object.keys(COINS).filter((s) => s !== toSymbol)}
            ariaLabel="Currency to trade from"
          />
          <input
            id={fieldId + "-from"}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>
      </div>

      <button className="swap-icon" onClick={handleSwap} aria-label="Swap direction">
        ⇅
      </button>

      <div className="input-group">
        <label htmlFor={fieldId + "-to"}>To</label>
        <div className="coin-input">
          <input
            id={fieldId + "-to"}
            type="text"
            inputMode="decimal"
            readOnly
            aria-readonly="true"
            value={
              toAmount
                ? toCoin.isCash
                  ? toAmount.toFixed(2)
                  : toAmount.toFixed(6)
                : "0.00"
            }
          />
          <CoinSelect
            value={toSymbol}
            onChange={setToSymbol}
            options={Object.keys(COINS).filter((s) => s !== fromSymbol)}
            ariaLabel="Currency to trade into"
          />
        </div>
      </div>

      <p className="total-line">
        Total{" "}
        <span>
          {loading
            ? "Fetching live prices…"
            : error
            ? "Price unavailable right now"
            : formatUsd(usdValue)}
        </span>
      </p>

      <div className="trade-feedback" aria-live="polite" aria-atomic="true">
        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : undefined}
            className={feedback.type === "success" ? "feedback-success" : "feedback-error"}
          >
            {feedback.text}
          </p>
        )}
      </div>

      {confirming ? (
        <ConfirmPanel
          title={`Review your ${effectiveMode}`}
          rows={[
            { label: "Action", value: `${effectiveMode === "buy" ? "Buy" : "Sell"} ${coinInvolved}` },
            {
              label: effectiveMode === "buy" ? "You receive" : "You sell",
              value: `${coinAmount.toFixed(6)} ${coinInvolved}`,
            },
            { label: "Total", value: formatUsd(usdValue) },
          ]}
          confirmLabel={effectiveMode === "buy" ? "Confirm buy" : "Confirm sell"}
          busy={submitting}
          onConfirm={handleTrade}
          onBack={() => setConfirming(false)}
        />
      ) : (
        <button
          className="buy-btn"
          onClick={startReview}
          disabled={loading || !!error || submitting}
        >
          {effectiveMode === "buy" ? "Review buy" : "Review sell"}
        </button>
      )}

      <style>{`
        .trade-card {
          min-height: 300px;
        }

        .toggle-row {
          position: relative;
          display: flex;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .toggle-pill {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: var(--accent);
          border-radius: 8px;
          transition: transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .toggle-pill.slide-right {
          transform: translateX(100%);
        }
        .toggle-btn {
          position: relative;
          z-index: 1;
          flex: 1;
          min-height: 44px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 14px;
          padding: 10px 0;
          border-radius: 8px;
          transition: color 0.15s ease;
        }
        .toggle-btn.active { color: #fff; }

        .input-group { margin-bottom: 12px; }
        .input-group label { font-size: 12.5px; color: var(--text-muted); }

        .coin-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 14px 16px;
          margin-top: 6px;
          transition: border-color 0.15s, background 0.15s;
        }
        .coin-input:focus-within {
          border-color: var(--accent);
          background: var(--fill-hover);
        }
        .coin-input input {
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          width: 100%;
        }

        .swap-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px auto 12px;
          background: var(--accent);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.15s, background 0.15s;
        }
        .swap-icon::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
        }
        .swap-icon:hover {
          background: var(--accent-deep);
          transform: rotate(180deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .swap-icon:hover { transform: none; }
        }

        .total-line {
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .total-line span { color: var(--text); font-weight: 600; }


        .buy-btn {
          width: 100%;
          margin-top: 24px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .buy-btn:hover { background: var(--accent-deep); }
        .buy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .coin-select-field { flex-shrink: 0; }
        .coin-select-field .ui-select { width: auto; }
        .coin-select-field .ui-select-trigger {
          position: relative;
          gap: 6px;
          font-weight: 600;
          white-space: nowrap;
        }
        .coin-select-field .ui-select-trigger::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 100%;
          height: 44px;
        }
        .coin-select-field .ui-select-panel {
          left: 0;
          min-width: 130px;
          background: rgba(28, 28, 46, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-color: var(--glass-border);
        }
        .coin-select-icon { width: 18px; height: 18px; border-radius: 50%; object-fit: contain; }
        .coin-select-icon-text { font-size: 15px; }
      `}</style>
    </div>
    </VerifyGate>
  );
}
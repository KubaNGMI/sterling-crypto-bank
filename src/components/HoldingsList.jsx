import { COINS, isImageIcon } from "../coins";
import { formatUsd } from "../utils/format";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";
import CardLoading from "./CardLoading";
import HoldingWalletCell from "./HoldingWalletCell";

export default function HoldingsList({ holdings, prices, loading }) {
  return (
    <div className="card holdings-card">
      <p className="label">Holdings</p>

      {loading ? (
        <CardLoading label="Loading holdings" rows={4} />
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={emptyIcons.coins}
          title="No holdings yet"
          hint="Coins you buy show up here with their live value."
          action={{ label: "Trade on Exchange", to: "/exchange" }}
        />
      ) : (
        <div className="holdings-list">
          {holdings.map((h) => {
            const coin = COINS[h.symbol];
            const price = coin ? prices[coin.id]?.usd : null;
            const value = price ? price * h.amount : null;

            return (
              <div className="holding-row" key={h.symbol}>
                <div className="holding-id">
                  {coin && isImageIcon(coin.icon) ? (
                    <img src={coin.icon} alt={h.symbol} className="holding-icon" />
                  ) : (
                    <span className="holding-icon-text">◈</span>
                  )}
                  <div className="holding-id-text">
                    <span className="holding-symbol">{h.symbol}</span>
                    <span className="holding-qty">
                      {h.amount.toFixed(6)} {h.symbol}
                    </span>
                  </div>
                </div>

                <span className="holding-value">
                  ≈ {value != null ? formatUsd(value) : "—"}
                </span>

                <div className="holding-wallet">
                  <HoldingWalletCell symbol={h.symbol} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .holdings-empty {
          color: var(--text-muted);
          font-size: 13px;
          margin-top: 12px;
        }
        .holdings-list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .holding-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 4px;
          border-bottom: 1px solid var(--glass-border);
        }
        .holding-row:last-child { border-bottom: none; }
        .holding-id {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .holding-id-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .holding-icon { width: 30px; height: 30px; border-radius: 50%; object-fit: contain; }
        .holding-icon-text {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--card-bg-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--text-muted);
        }
        .holding-symbol { font-size: 14px; font-weight: 600; }
        .holding-qty { font-size: 12.5px; color: var(--text-muted); }

        .holding-value {
          margin-left: auto;
          font-size: 14px;
          font-weight: 600;
        }

        .holding-wallet { flex-shrink: 0; }

        @media (max-width: 560px) {
          .holding-row { flex-wrap: wrap; }
          .holding-value { margin-left: auto; }
          .holding-wallet { width: 100%; display: flex; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}
import { COINS, isImageIcon } from "../coins";
import { formatUsd } from "../utils/format";
import { supportMailto } from "../config/support";

// Only deposits and coin credits show here — the two "something is coming
// to me" cases a user would actually want an explanation for. Pending
// withdrawals/transfers are the user's own outbound action, not something
// they're waiting to receive, so they don't need this treatment.
function isIncomingPending(t) {
  if (t.status !== "pending") return false;
  if (t.type === "deposit") return true;
  return t.type === "adjustment" && Number(t.coin_amount) > 0;
}

export default function PendingTransactions({ transactions }) {
  const items = transactions.filter(isIncomingPending);

  if (items.length === 0) return null;

  return (
    <div className="card pending-card">
      <p className="label">Pending</p>
      <p className="pending-sub">
        Awaiting confirmation — not yet counted in Cash or Holdings.
      </p>

      <div className="pending-list">
        {items.map((t) => {
          const isCoin = t.type === "adjustment";
          const coin = isCoin ? COINS[t.coin_symbol] : COINS.USD;

          return (
            <div className="pending-row" key={t.id}>
              <div className="pending-left">
                {coin && isImageIcon(coin.icon) ? (
                  <img src={coin.icon} alt={coin.symbol} className="pending-icon" />
                ) : (
                  <span className="pending-icon-text">{coin?.icon ?? "◈"}</span>
                )}
                <div>
                  <p className="pending-title">
                    {isCoin ? `${t.coin_symbol} credit` : "Deposit"}
                    <span className="pending-badge">Pending</span>
                  </p>
                  <p className="pending-date">
                    {new Date(t.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pending-right">
                <p className="pending-amount">
                  {isCoin
                    ? `+${Number(t.coin_amount)} ${t.coin_symbol}`
                    : `+${formatUsd(Number(t.usd_amount))}`}
                </p>
                <p className="pending-reason">{t.note || "No reason provided"}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="pending-contact">
        Questions about one of these?{" "}
        <a href={supportMailto("Question about a pending transaction")}>
          Contact support
        </a>{" "}
        with the date and amount above.
      </p>

      <style>{`
        .pending-card {
          margin-bottom: 24px;
        }
        .pending-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .pending-list {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pending-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 4px;
          border-bottom: 1px solid var(--glass-border);
        }
        .pending-row:last-child { border-bottom: none; }
        .pending-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .pending-icon { width: 30px; height: 30px; border-radius: 50%; object-fit: contain; flex-shrink: 0; }
        .pending-icon-text {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--card-bg-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .pending-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }
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
        .pending-date { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        /* min-width: 0 so this half can actually shrink. Without it the 220px
           reason sets a floor the flex row can't go below, and the block gets
           laid over .pending-left instead of squeezing it. */
        .pending-right { text-align: right; min-width: 0; }
        .pending-amount { font-size: 14px; font-weight: 600; color: var(--green); }
        .pending-reason {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 2px;
          max-width: 220px;
          /* Deposit notes carry a transaction hash, which is one long
             unbreakable token and will happily leave the card without this. */
          overflow-wrap: anywhere;
        }

        /* Side by side needs roughly 280px before the two halves start
           fighting; a phone card has 285px of inner width, so below this the
           row stacks instead. */
        @media (max-width: 560px) {
          .pending-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .pending-right { text-align: left; }
          .pending-reason { max-width: none; }
        }
        .pending-contact {
          margin-top: 16px;
          font-size: 12.5px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

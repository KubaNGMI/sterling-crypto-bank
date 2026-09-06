import { useTransactions } from "../hooks/useTransactions";
import { calculateBalance } from "../utils/transactions";
import TrendingMarket from "../components/TrendingMarket";
import TransactionHistory from "../components/TransactionHistory";
import TradePanel from "../components/TradePanel";

export default function Exchange() {
  const { transactions, loading, error, refetch } = useTransactions();
  const balance = calculateBalance(transactions);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Exchange <span>Crypto</span>
          </h1>
          <p>Trade across all supported assets and track your recent activity.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", marginBottom: 16 }}>
          Couldn't load your data: {error}
        </p>
      )}

      <div className="exchange-grid">
        <div className="exchange-left">
          <TrendingMarket />
          <TransactionHistory transactions={transactions} loading={loading} />
        </div>
        <div className="exchange-right">
          <TradePanel onTradeComplete={refetch} balance={balance} />
        </div>
      </div>

      <style>{`
        .exchange-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .exchange-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 1000px) {
          .exchange-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
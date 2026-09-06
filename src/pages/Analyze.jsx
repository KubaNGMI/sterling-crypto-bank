import { useTransactions } from "../hooks/useTransactions";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { calculateTotals, calculateCashFlowSeries } from "../utils/analytics";
import { calculateHoldings } from "../utils/holdings";
import SummaryCards from "../components/SummaryCards";
import CashFlowChart from "../components/CashFlowChart";
import PortfolioDonut from "../components/PortfolioDonut";

export default function Analyze() {
  const { transactions, loading, error } = useTransactions();

  const totals = calculateTotals(transactions);
  const cashFlowSeries = calculateCashFlowSeries(transactions);
  const holdings = calculateHoldings(transactions);

  const { prices, loading: pricesLoading } = useCryptoPrices();

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Analyze <span>Activity</span>
          </h1>
          <p>A closer look at your spending, income, and portfolio makeup.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", marginBottom: 16 }}>
          Couldn't load your data: {error}
        </p>
      )}

      <SummaryCards totals={totals} />

      <div className="analyze-grid">
        <CashFlowChart data={cashFlowSeries} loading={loading} />
        <PortfolioDonut holdings={holdings} prices={prices} loading={loading || pricesLoading} />
      </div>

      <style>{`
        .analyze-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1000px) {
          .analyze-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
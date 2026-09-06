import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { calculateBalance } from "../utils/transactions";
import {
  calculateHoldings,
  calculateHoldingsValue,
  calculatePendingValue,
  calculatePortfolioValue,
} from "../utils/holdings";
import AddFunds from "../components/AddFunds";
import BalanceDonut from "../components/BalanceDonut";
import HoldingsList from "../components/HoldingsList";
import PendingTransactions from "../components/PendingTransactions";
import TransactionHistory from "../components/TransactionHistory";
import TransactionDetailModal from "../components/TransactionDetailModal";
import BankAccounts from "../components/wallet/BankAccounts";
import EuAccountDetails from "../components/wallet/EuAccountDetails";

export default function MyWallet() {
  const { transactions, loading, error, refetch } = useTransactions();
  const location = useLocation();
  const [selectedTx, setSelectedTx] = useState(null);
  const handledNav = useRef(null);

  // Arriving here from a notification click: open that transaction's detail
  // modal if we can resolve it, otherwise fall back to scrolling the history
  // list into view. Guarded by location.key so a later transactions refetch
  // doesn't re-open the modal after the user closes it.
  useEffect(() => {
    const st = location.state;
    if (!st || loading) return;
    if (handledNav.current === location.key) return;
    handledNav.current = location.key;

    if (st.openTransaction) {
      const match = transactions.find((t) => t.id === st.openTransaction);
      if (match) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot response to a route-navigation event, guarded by location.key
        setSelectedTx(match);
        return;
      }
    }
    if (st.openTransaction || st.scrollTo === "transaction-history") {
      document
        .getElementById("transaction-history")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.key, location.state, loading, transactions]);

  const cashBalance = calculateBalance(transactions);
  const holdings = calculateHoldings(transactions);

  const { prices } = useCryptoPrices();

  const holdingsValue = calculateHoldingsValue(holdings, prices);
  const pendingValue = calculatePendingValue(transactions, prices);
  const portfolioValue = calculatePortfolioValue(cashBalance, holdings, prices, pendingValue);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            My <span>Wallet</span>
          </h1>
          <p>Your balance, holdings, and full transaction history.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", marginBottom: 16 }}>
          Couldn't load your data: {error}
        </p>
      )}

      <BalanceDonut
        cash={cashBalance}
        holdings={holdingsValue}
        pending={pendingValue}
        total={portfolioValue}
      />

      <PendingTransactions transactions={transactions} />

      <div className="wallet-mid-row">
        <AddFunds onComplete={refetch} />
      </div>

      <div className="wallet-mid-row">
        <HoldingsList holdings={holdings} prices={prices} loading={loading} />
      </div>

      <div className="wallet-mid-row">
        <BankAccounts />
      </div>

      <EuAccountDetails />

      <TransactionHistory
        transactions={transactions}
        loading={loading}
        onSelectTransaction={setSelectedTx}
      />

      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}

      <style>{`
        .wallet-mid-row {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}

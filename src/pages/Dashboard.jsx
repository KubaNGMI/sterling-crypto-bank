import { useState, useEffect } from "react";
import WalletOrbit from "../components/WalletOrbit";
import SpendingChart from "../components/SpendingChart";
import TrendingMarket from "../components/TrendingMarket";
import TradePanel from "../components/TradePanel";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../hooks/useTransactions";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { useProfile } from "../hooks/useProfile";
import { nameVariants } from "../utils/identity";
import {
  calculateHoldings,
  calculatePortfolioValue,
  calculatePendingValue,
} from "../utils/holdings";
import {
  calculateBalance,
  calculateSpendingSeries,
  calculateTotalSpending,
} from "../utils/transactions";

// "Hello" around the world, kept readable in Latin script. First entry is the
// familiar one; the rest rotate in while you're on the page.
const GREETINGS = [
  "Welcome back",
  "Hello",
  "Hola",
  "Bonjour",
  "Ciao",
  "Hallo",
  "Namaste",
  "Aloha",
  "Konnichiwa",
  "Privet",
  "Ni hao",
  "Merhaba",
];

const SUBTEXTS = [
  "Hope your day's going well.",
  "Good to see you again.",
  "Markets are moving — take a look.",
  "Your portfolio's right where you left it.",
  "Wishing you a good one.",
  "Let's make today count.",
  "Here's what's been happening.",
  "All quiet on the account front.",
  "Ready when you are.",
  "Take your time, look around.",
  "Hope you're having a good week.",
  "Nice to have you back.",
  "Let's see how things are looking.",
  "Steady as she goes.",
  "Everything's up to date.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { transactions, error, refetch } = useTransactions();

  // Rotate the greeting line every 2–5 minutes: a different "hello", a
  // slightly less formal name, a fresh bit of subtext.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let id;
    const schedule = () => {
      const delay = (120 + Math.random() * 180) * 1000;
      id = setTimeout(() => {
        setTick((t) => t + 1);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(id);
  }, []);

  const cashBalance = calculateBalance(transactions);
  const holdings = calculateHoldings(transactions);
  const { prices } = useCryptoPrices();
  const pendingValue = calculatePendingValue(transactions, prices);
  const portfolioValue = calculatePortfolioValue(cashBalance, holdings, prices, pendingValue);

  const spendingSeries = calculateSpendingSeries(transactions);
  const totalSpending = calculateTotalSpending(transactions);

  const names = nameVariants(profile, user?.email);
  const greeting = GREETINGS[tick % GREETINGS.length];
  const subtext = SUBTEXTS[tick % SUBTEXTS.length];
  const displayName = names[tick % names.length];

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 key={"g" + tick} className="route-fade">
            {greeting} <span>{displayName}!</span>
          </h1>
          <p key={"s" + tick} className="route-fade">
            {subtext}
          </p>
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", marginBottom: 16 }}>
          Couldn't load your data: {error}
        </p>
      )}

      <div className="top-row">
        <WalletOrbit total={portfolioValue} />
        <SpendingChart total={totalSpending} data={spendingSeries} />
      </div>

      <div className="bottom-row">
        <TrendingMarket />
        <TradePanel onTradeComplete={refetch} balance={cashBalance} />
      </div>
    </div>
  );
}
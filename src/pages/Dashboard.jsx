import { useEffect, useMemo, useState } from "react";
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
  const { transactions, loading, error, refetch } = useTransactions();

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

  const { prices } = useCryptoPrices();

  // Every figure below walks the full ledger. Without this they'd re-derive on
  // each greeting rotation and each 60s price tick, whether or not the inputs
  // moved.
  const cashBalance = useMemo(() => calculateBalance(transactions), [transactions]);
  const holdings = useMemo(() => calculateHoldings(transactions), [transactions]);
  const portfolioValue = useMemo(() => {
    const pendingValue = calculatePendingValue(transactions, prices);
    return calculatePortfolioValue(cashBalance, holdings, prices, pendingValue);
  }, [transactions, prices, cashBalance, holdings]);

  const spendingSeries = useMemo(() => calculateSpendingSeries(transactions), [transactions]);
  const totalSpending = useMemo(() => calculateTotalSpending(transactions), [transactions]);

  const names = nameVariants(profile, user?.user_metadata);
  const greeting = GREETINGS[tick % GREETINGS.length];
  const subtext = SUBTEXTS[tick % SUBTEXTS.length];
  const displayName = names[tick % names.length];

  // The ledger is what every figure on this page is derived from. Until it
  // lands, the cards show a skeleton rather than a confident $0.00 — a zero
  // balance you can't distinguish from "still loading" is the one thing a
  // money surface must never show.
  const figuresPending = loading && !error;

  // A funded account and a brand-new one both compute to zero. Only the second
  // one is an empty state, and it's the activation path: nothing has happened
  // on this account yet, so point at the first thing worth doing.
  const noActivityYet = !loading && !error && transactions.length === 0;

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

      <div aria-live="polite" aria-atomic="true">
        {error && (
          <div className="feedback-error feedback-banner" role="alert">
            <p className="feedback-banner__text">
              We couldn't load your account data. {error}
            </p>
            <button
              type="button"
              className="feedback-banner__action"
              onClick={refetch}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="top-row">
        <WalletOrbit
          total={portfolioValue}
          loading={figuresPending}
          empty={noActivityYet}
        />
        <SpendingChart
          total={totalSpending}
          data={spendingSeries}
          loading={figuresPending}
          empty={noActivityYet}
        />
      </div>

      <div className="bottom-row">
        <TrendingMarket />
        <TradePanel
          onTradeComplete={refetch}
          balance={cashBalance}
          holdings={holdings}
        />
      </div>
    </div>
  );
}

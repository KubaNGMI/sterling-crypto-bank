import { isSettled } from "./transactions";

// Groups all transactions into the categories the summary cards show.
// Pending entries are excluded — they haven't actually moved money yet.
export function calculateTotals(transactions) {
  const totals = { deposited: 0, spent: 0, received: 0 };

  transactions.filter(isSettled).forEach((t) => {
    const amount = Number(t.usd_amount);
    if (t.type === "deposit") totals.deposited += amount;
    else if (t.type === "buy") totals.spent += Math.abs(amount);
    else if (t.type === "sell") totals.received += amount;
    else if (t.type === "withdrawal" || t.type === "transfer_out")
      totals.spent += Math.abs(amount);
    else if (t.type === "transfer_in") totals.received += amount;
  });

  totals.net = totals.deposited + totals.received - totals.spent;
  return totals;
}

// Net cash flow per day over the last N days — sums every transaction's
// signed usd_amount for that day. Positive = more came in than went out
// that day, negative = the opposite.
export function calculateCashFlowSeries(transactions, days = 30) {
  const series = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const dayLabel = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayStr = day.toISOString().split("T")[0];

    const dayTotal = transactions
      .filter((t) => t.created_at.startsWith(dayStr) && isSettled(t))
      .reduce((sum, t) => sum + Number(t.usd_amount), 0);

    series.push({ name: dayLabel, value: dayTotal });
  }

  return series;
}
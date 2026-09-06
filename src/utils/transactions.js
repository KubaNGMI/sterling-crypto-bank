// Rows default to "completed" when the column predates this status (or was
// never set) — only an explicit "pending" row is excluded from settled math.
export function isSettled(t) {
  return (t.status ?? "completed") === "completed";
}

// Balance = sum of every settled transaction. Positive amounts (deposits,
// sells) add to it, negative amounts (buys, withdrawals) subtract from it.
// Pending entries don't count until an admin confirms them.
export function calculateBalance(transactions) {
  return transactions
    .filter(isSettled)
    .reduce((sum, t) => sum + Number(t.usd_amount), 0);
}

// Builds a 7-day series of "money spent per day" for the area chart.
// Only counts negative transactions (spending), converted to a positive
// number for display, grouped by calendar day.
export function calculateSpendingSeries(transactions, days = 7) {
  const series = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
    const dayStr = day.toISOString().split("T")[0];

    const dayTotal = transactions
      .filter(
        (t) =>
          t.created_at.startsWith(dayStr) &&
          Number(t.usd_amount) < 0 &&
          isSettled(t)
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.usd_amount)), 0);

    series.push({ name: dayLabel, value: dayTotal });
  }

  return series;
}

// Total spent (outflows only) within the last N days — feeds the big
// number at the top of the Spending card.
export function calculateTotalSpending(transactions, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return transactions
    .filter(
      (t) =>
        new Date(t.created_at) >= cutoff &&
        Number(t.usd_amount) < 0 &&
        isSettled(t)
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.usd_amount)), 0);
}
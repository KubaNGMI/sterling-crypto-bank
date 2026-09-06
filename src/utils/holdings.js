import { COINS } from "../coins";
import { isSettled } from "./transactions";

// Buys and inbound transfers add to a coin's holding; sells and outbound
// transfers subtract. Admin "adjustment" rows carry a signed coin_amount and
// are trusted as-is. Deposits/withdrawals (coin_symbol is null) don't count.
const ADDITIVE = new Set(["buy", "transfer_in"]);
const SUBTRACTIVE = new Set(["sell", "transfer_out"]);

function signedDelta(t) {
  const amount = Number(t.coin_amount);
  if (ADDITIVE.has(t.type)) return Math.abs(amount);
  if (SUBTRACTIVE.has(t.type)) return -Math.abs(amount);
  return amount; // adjustment: signed
}

export function calculateHoldings(transactions) {
  const holdings = {};

  transactions.forEach((t) => {
    if (!t.coin_symbol || !t.coin_amount || !isSettled(t)) return;
    holdings[t.coin_symbol] = (holdings[t.coin_symbol] || 0) + signedDelta(t);
  });

  // Drop anything at ~zero (rounding dust) so fully-sold coins disappear
  return Object.entries(holdings)
    .filter(([, amount]) => amount > 0.000001)
    .map(([symbol, amount]) => ({ symbol, amount }));
}

// Live USD value of the coin holdings. Coins with no price yet (feed down,
// unknown symbol) contribute 0 until a price arrives.
export function calculateHoldingsValue(holdings, prices) {
  return holdings.reduce((sum, h) => {
    const id = COINS[h.symbol]?.id;
    const price = id ? prices?.[id]?.usd : null;
    return price ? sum + h.amount * price : sum;
  }, 0);
}

// USD value of everything still awaiting admin confirmation — a pending cash
// entry counts at its usd_amount, a pending coin entry at its live market
// value. Signed, so a pending withdrawal/transfer-out correctly shows as a
// negative (money that hasn't left yet, but will once confirmed).
export function calculatePendingValue(transactions, prices) {
  return transactions.reduce((sum, t) => {
    if (isSettled(t)) return sum;

    if (t.coin_symbol && t.coin_amount) {
      const id = COINS[t.coin_symbol]?.id;
      const price = id ? prices?.[id]?.usd : null;
      return price ? sum + signedDelta(t) * price : sum;
    }

    return sum + Number(t.usd_amount);
  }, 0);
}

// The headline "Total" — spendable cash, the market value of every coin, and
// anything still pending confirmation.
export function calculatePortfolioValue(cashBalance, holdings, prices, pendingValue = 0) {
  return cashBalance + calculateHoldingsValue(holdings, prices) + pendingValue;
}
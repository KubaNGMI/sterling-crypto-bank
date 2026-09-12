// One place for money formatting. `Money.jsx` animates its own figure via
// NumberFlow; this is for plain, non-animated USD strings everywhere else.
export function formatUsd(value, { cents = true } = {}) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })}`;
}

// Coin quantities. Enough precision for a small holding, without printing a
// float's full 17 digits — "+0.00394558252580411 ETH" was wide enough on its
// own to push the admin ledger's table past its card. Trailing zeros are
// trimmed so round numbers stay short ("12 ETH", not "12.00000000 ETH").
export function formatCoin(value, { maxDecimals = 8 } = {}) {
  const n = Number(value) || 0;
  const fixed = n.toFixed(maxDecimals);
  const trimmed = fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  // Dust that rounds away would otherwise read as a flat "0", which is a lie
  // about a balance that isn't empty.
  if (n !== 0 && Number(trimmed) === 0) {
    return `${n < 0 ? "-" : ""}<${(10 ** -maxDecimals).toFixed(maxDecimals)}`;
  }
  return trimmed;
}

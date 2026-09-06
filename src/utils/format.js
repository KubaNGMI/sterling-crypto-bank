// One place for money formatting. `Money.jsx` animates its own figure via
// NumberFlow; this is for plain, non-animated USD strings everywhere else.
export function formatUsd(value, { cents = true } = {}) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })}`;
}

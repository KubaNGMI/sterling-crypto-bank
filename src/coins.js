import btcIcon from "./assets/btc.svg";
import ethIcon from "./assets/eth-logo.svg";

// Add more coins here later — this is the one place TradePanel, the
// Exchange page, and My Wallet all read from, so adding a coin here
// makes it available everywhere automatically.
//
// icon can be either:
//   - an imported SVG file (like btcIcon/ethIcon below) for a real logo
//   - a plain text/emoji character as a placeholder until you source a
//     real SVG for that coin (isImageIcon tells the two apart automatically)
// USD is the cash balance itself — no CoinGecko id, price is always 1. It sits
// first so "spend cash to buy a coin" is the default direction in the trade
// panel.
export const COINS = {
  USD: { id: "usd", symbol: "USD", icon: "$", isCash: true },
  BTC: { id: "bitcoin", symbol: "BTC", icon: btcIcon },
  ETH: { id: "ethereum", symbol: "ETH", icon: ethIcon },
  USDT: { id: "tether", symbol: "USDT", icon: "₮" },
  BNB: { id: "binancecoin", symbol: "BNB", icon: "◆" },
  ADA: { id: "cardano", symbol: "ADA", icon: "❖" },
  LUNA: { id: "terra-luna-2", symbol: "LUNA", icon: "◐" },
};

// CoinGecko ids to actually fetch prices for (everything except cash).
export const PRICED_COIN_IDS = Object.values(COINS)
  .filter((c) => !c.isCash)
  .map((c) => c.id);

// USD in USD is 1; everything else comes from the live price map.
export function coinPrice(coin, prices) {
  if (!coin) return undefined;
  if (coin.isCash) return 1;
  return prices?.[coin.id]?.usd;
}

export function isImageIcon(icon) {
  return typeof icon === "string" && icon.includes("/");
}
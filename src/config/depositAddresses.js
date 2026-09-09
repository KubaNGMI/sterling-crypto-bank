import btcIcon from "../assets/btc.svg";
import ethIcon from "../assets/eth-logo.svg";
import bnbIcon from "../assets/bnb.svg";
import { isSettled } from "../utils/transactions";

// The rails a user can fund the account through.
//
// Deliberately separate from COINS in src/coins.js: that list is what you can
// *trade*, this is what you can *send us*, and the two move independently
// (SOL and TRX are deposit-only; ADA and LUNA are trade-only). A deposit asset
// needs a network and an address, not a price feed.
//
// `network` is shown beside the address and in the wrong-network warning.
// Sending on a chain we don't watch loses the funds, so it is never implied.
//
// `icon` follows the coins.js convention: an imported SVG where we have a real
// logo, otherwise null — AssetIcon draws a lettered chip rather than standing a
// Unicode glyph in for an icon.
export const DEPOSIT_ASSETS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "Ethereum",
    icon: ethIcon,
    color: "#627eea",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin",
    icon: btcIcon,
    color: "#f7931a",
    address: "1GhHQQRCaVVYza8qzqRvMcgx7nw5tcsAZ6",
  },
  {
    symbol: "SOL",
    name: "Solana",
    network: "Solana",
    icon: null,
    color: "#14f195",
    address: "8VG9U1PgVfmD4tHgBQXCfcDCBeijGyZj75xiyusytQoa",
  },
  {
    symbol: "USDT",
    name: "Tether",
    network: "Ethereum (ERC-20)",
    icon: null,
    color: "#26a17b",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "BNB",
    name: "BNB",
    network: "BNB Smart Chain (BEP-20)",
    icon: bnbIcon,
    color: "#f0b90b",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "TRX",
    name: "Tron",
    network: "Tron",
    icon: null,
    color: "#eb0029",
    address: "TXMqL7VYE9gq29R2CG9pArECVM6hSVDSnt",
  },
];

// A first deposit is capped while the account is still unproven. Later
// deposits are uncapped — change that here if that stops being true.
export const FIRST_DEPOSIT_LIMIT = 1000;

// The cap lifts only once a deposit has actually been *confirmed*. Counting
// pending rows would invert the protection: a user could file one capped
// request and immediately ask for an uncapped second while the first is still
// unconfirmed.
//
// This is a UI-level cap only. Until RLS and a server-side check are in place
// it can be bypassed by posting straight to the API, so treat it as guidance
// for honest users rather than as enforcement.
export function isFirstDeposit(transactions = []) {
  return !transactions.some((t) => t.type === "deposit" && isSettled(t));
}

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
    hashKind: "evm",
    name: "Ethereum",
    network: "Ethereum",
    icon: ethIcon,
    color: "#627eea",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "BTC",
    hashKind: "hex64",
    name: "Bitcoin",
    network: "Bitcoin",
    icon: btcIcon,
    color: "#f7931a",
    address: "1GhHQQRCaVVYza8qzqRvMcgx7nw5tcsAZ6",
  },
  {
    symbol: "SOL",
    hashKind: "base58",
    name: "Solana",
    network: "Solana",
    icon: null,
    color: "#14f195",
    address: "8VG9U1PgVfmD4tHgBQXCfcDCBeijGyZj75xiyusytQoa",
  },
  {
    symbol: "USDT",
    hashKind: "evm",
    name: "Tether",
    network: "Ethereum (ERC-20)",
    icon: null,
    color: "#26a17b",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "BNB",
    hashKind: "evm",
    name: "BNB",
    network: "BNB Smart Chain (BEP-20)",
    icon: bnbIcon,
    color: "#f0b90b",
    address: "0xea519376Ef7220E87C556D67c7c474d093aB0d3f",
  },
  {
    symbol: "TRX",
    hashKind: "hex64",
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

// A transaction id looks different on every chain, so each asset says which
// shape to expect. These are deliberately permissive — a slightly loose check
// that lets a real deposit through beats a strict one that blocks it.
const HASH_RULES = {
  // 0x plus 32 bytes of hex.
  evm: {
    test: (v) => /^0x[0-9a-fA-F]{64}$/.test(v),
    hint: "Starts with 0x, followed by 64 characters.",
  },
  // Bitcoin and Tron both use bare 32-byte hex.
  hex64: {
    test: (v) => /^[0-9a-fA-F]{64}$/.test(v),
    hint: "64 characters, letters a-f and digits only.",
  },
  // A Solana signature is base58 — no 0, O, I or l — and runs about 88 chars.
  base58: {
    test: (v) => /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(v),
    hint: "The signature from your wallet, around 88 characters.",
  },
};

// People paste explorer links as often as bare hashes. Take the last path
// segment and drop any query string so both work.
export function normalizeTxHash(raw = "") {
  let v = String(raw).trim();
  if (!v) return "";
  v = v.split("?")[0].split("#")[0];
  if (v.includes("/")) v = v.split("/").filter(Boolean).pop() ?? "";
  return v.trim();
}

export function txHashHint(asset) {
  return HASH_RULES[asset?.hashKind]?.hint ?? "Paste the transaction id from your wallet.";
}

// Returns an error string, or null when the value looks like a transaction id
// for this asset's chain. Shape only — whether it exists on-chain, and whether
// it actually pays us, is what the admin checks before confirming.
export function validateTxHash(asset, raw) {
  const v = normalizeTxHash(raw);
  if (!v) return "Paste the transaction hash so we can match your transfer.";
  const rule = HASH_RULES[asset?.hashKind];
  if (rule && !rule.test(v)) {
    return `That does not look like a ${asset.symbol} transaction hash. ${rule.hint}`;
  }
  return null;
}

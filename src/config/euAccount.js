// Mock EU virtual-account details. Identical for every user (this is a
// mockup) — the "receive EUR into this IBAN" pattern that fintechs give
// their customers. NOT a real bank account; the IBAN is a generic example
// value and the BIC is invented.
export const EU_ACCOUNT = {
  holder: "Sterling Crypto Bank UAB",
  bank: "Sterling Crypto Bank UAB (Lithuania)",
  iban: "LT12 1000 0111 0100 1000",
  bic: "STGBLT21XXX",
  currency: "EUR",
};

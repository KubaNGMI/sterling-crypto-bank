// Bank-account regions and the field rules for each.

export const BANK_REGIONS = {
  AU: {
    label: "Australia",
    currency: "AUD",
    iso2: "AU",
    hint: "BSB and account number",
    hasBsb: true,
    hasPayId: true,
    accountNumberHint: "6 to 10 digits",
  },
  NZ: {
    label: "New Zealand",
    currency: "NZD",
    iso2: "NZ",
    hint: "Bank–branch–account–suffix number",
    hasBsb: false,
    hasPayId: false,
    accountNumberHint: "15 or 16 digits (BB-bbbb-AAAAAAA-SS)",
  },
};

export const digits = (s) => (s || "").replace(/\D/g, "");

// "123456" -> "123-456"
export function formatBsb(value) {
  const d = digits(value).slice(0, 6);
  return d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
}

// "1234560012345600" -> "12-3456-0012345-600"
export function formatNzAccount(value) {
  const d = digits(value).slice(0, 16);
  const parts = [d.slice(0, 2), d.slice(2, 6), d.slice(6, 13), d.slice(13)];
  return parts.filter(Boolean).join("-");
}

export function maskAccountNumber(value) {
  const d = digits(value);
  if (d.length <= 3) return d;
  return `•••• ${d.slice(-3)}`;
}

// Returns an error string, or null when the details are valid for the region.
export function validateBankDetails(region, { accountName, bsb, accountNumber }) {
  if (!accountName || !accountName.trim()) return "Enter the account holder name.";
  if (region === "AU") {
    if (digits(bsb).length !== 6) return "BSB must be 6 digits (XXX-XXX).";
    const n = digits(accountNumber).length;
    if (n < 6 || n > 10) return "Account number must be 6–10 digits.";
  }
  if (region === "NZ") {
    const n = digits(accountNumber).length;
    if (n < 15 || n > 16) return "NZ account number must be 15 or 16 digits.";
  }
  return null;
}

// Bank-account regions and the field rules for each.
//
// Everything that differs between countries lives in BANK_REGIONS, so the form,
// the review step and the two places that list saved accounts all read from one
// description instead of branching on the region code. Adding a fourth country
// should be a config entry, not an edit to five components.
//
// `branchCode` is the routing number a country puts in front of the account
// number — a BSB in Australia, a sort code in the UK, nothing in New Zealand
// (where it is folded into the account number itself). It is stored in the
// `bank_accounts.bsb` column for all regions: the column name is Australian,
// but the data is the same shape and renaming it would mean a migration for no
// behavioural gain. Display always uses branchCode.label, never "BSB".

export const BANK_REGIONS = {
  AU: {
    label: "Australia",
    currency: "AUD",
    iso2: "AU",
    hint: "BSB and account number",
    branchCode: { label: "BSB", hint: "6 digits", groups: [3, 3] },
    hasPayId: true,
    accountNumber: { hint: "6 to 10 digits", min: 6, max: 10 },
  },
  NZ: {
    label: "New Zealand",
    currency: "NZD",
    iso2: "NZ",
    hint: "Bank–branch–account–suffix number",
    branchCode: null,
    hasPayId: false,
    accountNumber: {
      hint: "15 or 16 digits (BB-bbbb-AAAAAAA-SS)",
      min: 15,
      max: 16,
      groups: [2, 4, 7, 3],
    },
  },
  GB: {
    label: "United Kingdom",
    currency: "GBP",
    iso2: "GB",
    hint: "Sort code and account number",
    branchCode: { label: "Sort code", hint: "6 digits", groups: [2, 2, 2] },
    hasPayId: false,
    accountNumber: { hint: "8 digits", min: 8, max: 8 },
  },
};

export const digits = (s) => (s || "").replace(/\D/g, "");

// Split a digit string into fixed-width groups: [3,3] turns 123456 into
// "123-456", [2,2,2] into "12-34-56". Trailing groups that have no digits yet
// are dropped so the field reads naturally while it is being typed.
function group(value, sizes, separator = "-") {
  const total = sizes.reduce((a, b) => a + b, 0);
  const d = digits(value).slice(0, total);
  const parts = [];
  let at = 0;
  for (const size of sizes) {
    parts.push(d.slice(at, at + size));
    at += size;
  }
  return parts.filter(Boolean).join(separator);
}

// "123456" -> "123-456" (AU), "12-34-56" (GB). Returns plain digits for a
// region that has no branch code.
export function formatBranchCode(region, value) {
  const sizes = BANK_REGIONS[region]?.branchCode?.groups;
  return sizes ? group(value, sizes) : digits(value);
}

// NZ writes its account number in groups; everywhere else it is plain digits.
export function formatAccountNumber(region, value) {
  const cfg = BANK_REGIONS[region]?.accountNumber;
  if (cfg?.groups) return group(value, cfg.groups);
  return digits(value).slice(0, cfg?.max ?? 34);
}

// What to call the branch code on screen for a saved account, so a UK account
// is never labelled "BSB". Null when the region has none.
export function branchCodeLabel(region) {
  return BANK_REGIONS[region]?.branchCode?.label ?? null;
}

export function maskAccountNumber(value) {
  const d = digits(value);
  if (d.length <= 3) return d;
  return `•••• ${d.slice(-3)}`;
}

// Returns an error string, or null when the details are valid for the region.
export function validateBankDetails(region, { accountName, bsb, accountNumber }) {
  if (!accountName || !accountName.trim()) return "Enter the account holder name.";

  const cfg = BANK_REGIONS[region];
  if (!cfg) return "Pick a region.";

  if (cfg.branchCode) {
    const expected = cfg.branchCode.groups.reduce((a, b) => a + b, 0);
    if (digits(bsb).length !== expected) {
      return `${cfg.branchCode.label} must be ${expected} digits.`;
    }
  }

  const n = digits(accountNumber).length;
  const { min, max } = cfg.accountNumber;
  if (n < min || n > max) {
    return min === max
      ? `Account number must be ${min} digits.`
      : `Account number must be ${min}–${max} digits.`;
  }

  return null;
}

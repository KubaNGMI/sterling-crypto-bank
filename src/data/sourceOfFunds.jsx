// Shared between the signup wizard, which asks where your money comes from,
// and the proof-of-funds card, which later asks you to evidence the answer.
// The two have to agree on the wording or the second one asks for a document
// that doesn't match anything the first one offered.

import LineIcon from "../components/LineIcon";

export const SOURCE_OF_FUNDS_OPTIONS = [
  {
    key: "employment",
    label: "Employment / Freelance / Self-Employed",
    hint: "Salary, bonus, pension, or independent work",
    icon: (
      <LineIcon>
        <rect x="2" y="5" width="12" height="8.5" rx="1.5" />
        <path d="M6 5V3.8A1.3 1.3 0 0 1 7.3 2.5h1.4A1.3 1.3 0 0 1 10 3.8V5" />
        <path d="M2 8.6h12" />
      </LineIcon>
    ),
    proofHint: "Recent payslip, employment letter, or tax return",
  },
  {
    key: "investments",
    label: "Investments / Financial Assets",
    hint: "Dividends, stock sales, or investment returns",
    icon: (
      <LineIcon>
        <path d="M2.2 13h11.6" />
        <path d="M3.6 10.4 6.6 7.4l2 2 4.2-4.7" />
        <path d="M10.2 4.7h2.8v2.8" />
      </LineIcon>
    ),
    proofHint: "Brokerage statement or dividend confirmation",
  },
  {
    key: "real_estate",
    label: "Real Estate",
    hint: "Sale of property or land",
    icon: (
      <LineIcon>
        <path d="M2.5 7.2 8 3l5.5 4.2" />
        <path d="M4 8.3v5.2h8V8.3" />
        <path d="M6.8 13.5V10h2.4v3.5" />
      </LineIcon>
    ),
    proofHint: "Sale contract, deed, or settlement statement",
  },
  {
    key: "other",
    label: "Other Sources",
    hint: "Gifts, gaming/lottery wins, or legal settlements",
    icon: (
      <LineIcon>
        <rect x="2.5" y="6.6" width="11" height="6.9" rx="1" />
        <path d="M2.5 9.7h11" />
        <path d="M8 6.6v6.9" />
        <circle cx="6.5" cy="5.1" r="1.4" />
        <circle cx="9.5" cy="5.1" r="1.4" />
      </LineIcon>
    ),
    proofHint: "Gift letter, payout notice, or settlement letter",
  },
];

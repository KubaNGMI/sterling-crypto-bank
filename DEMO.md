# Demo mode — what's fake, and what it takes to go live

Sterling Crypto Bank is a portfolio project. It looks like a bank, asks for what
a bank asks for, and shows a real crypto address to send money to. Anyone taking
it at face value could lose documents or funds, so while it's a demo it says so
on every screen where that mistake is possible.

This file is the inventory: what currently announces itself as a demo, and what
has to actually change before any of it could be real.

---

## 1. The switch

```js
// src/config/demo.js
export const DEMO_MODE = true;
```

Set it to `false` and **every notice disappears at once**. Nothing else in the
app changes.

That is deliberately the easy half. Section 3 is the half a boolean can't do.

All copy lives beside the flag in `DEMO_NOTICES`, keyed by surface. Editing the
wording is a one-file change; no notice text is hardcoded in a component.

---

## 2. Where the notices appear

One component renders all of them — `src/components/DemoNotice.jsx` — and it
returns `null` when `DEMO_MODE` is false.

| Surface | File | Variant | Why it's there |
|---|---|---|---|
| Deposit modal | `components/DepositModal.jsx` | `deposit` | **Highest stakes.** Shows a real, valid crypto address and instructs the user to send to it. Irreversible. |
| Identity verification | `components/VerificationUpload.jsx` | `identity` | Government ID, a selfie holding it, and a bank statement. |
| Proof of funds | `components/ProofOfFundsUpload.jsx` | `proofOfFunds` | Payslips, brokerage statements, deeds. |
| Add bank account | `pages/AddBankAccount.jsx` | `bankDetails` | Account number, BSB / NZ account. |
| EU account card | `components/wallet/EuAccountDetails.jsx` | `euAccount` | Invented IBAN/BIC, with copy inviting the user to *"share them with anyone paying you."* |
| Login / Signup / Reset | `components/AuthShell.jsx` | `auth` | The front door. Shared chrome, so all three screens get it by construction. |

`tone="alert"` (amber) is used where acting on the illusion costs money or leaks
documents. `tone="quiet"` is used on the auth screens, where it's context rather
than a warning.

### Not covered, deliberately

- **Trading** — a `trading` variant exists in `DEMO_NOTICES` but is not mounted.
  The trade panel risks nothing real: no order leaves the browser and the money
  is simulated. Add `<DemoNotice variant="trading" />` to `TradePanel.jsx` if you
  want it, but more banners make the ones that matter easier to skim past.
- **Admin** — only you can reach it.

---

## 3. What is actually fake

Flipping the flag hides the notices. It does **not** make any of the following
true. Each needs a real replacement.

### Money

| What | Where | Currently |
|---|---|---|
| Crypto deposit addresses | `config/depositAddresses.js` | One real ETH address (`0xea5193…0d3f`) reused across assets. Nothing watches it; deposits are credited by hand in the admin ledger. |
| EU virtual account | `config/euAccount.js` | Invented IBAN and BIC, identical for every user, attached to a company (`Sterling Crypto Bank UAB`) that does not exist. |
| Deposit confirmation | Admin → Ledger | A human clicks Confirm. No chain is watched, no transaction hash is checked against anything. |
| Balances | `utils/transactions.js` | Derived from rows in the database. No custody, no reconciliation. |
| Prices | CoinGecko | **Real** market data. This part is genuine. |

### Identity

| What | Where | Currently |
|---|---|---|
| KYC documents | `components/VerificationUpload.jsx` | Raw files in a private Supabase bucket. No liveness check, no document authentication, no sanctions or PEP screening. A real deployment wants Stripe Identity, Persona or Veriff instead — the bucket goes away entirely. |
| Verification decisions | Admin → user drawer | You approve or reject by eye. |

### Operations

| What | Where | Currently |
|---|---|---|
| Artificial delay | `utils/mockLatency.js` | Fake 0.5–1.5s waits so admin actions feel like they hit a server. **Remove when real calls replace them.** |
| Delayed notifications | client `setTimeout` | Lost if the tab closes. Needs a server-side job. |
| Admin identity | `config/admins.js` + `public.is_admin()` | Two lists — one gates the UI by email, one gates the database by uid. They must be kept in sync by hand. |

### Legal — none of this exists yet

- Terms of service, privacy policy, cookie notice.
- A real support address (`support@…` currently goes nowhere).
- Any registration. Taking custody of customer crypto and running KYC is
  regulated activity in essentially every jurisdiction — money transmitter / VASP
  registration, AML program, and data-protection duties for the ID documents.
  **This is the part that gates everything else, and no amount of code
  substitutes for it.**

---

## 4. Order to do it in

If this ever stops being a portfolio piece:

1. **Legal and regulatory first.** Registration, and advice on what you're
   allowed to hold. Everything below is wasted effort if this comes back no.
2. **Replace identity** with a licensed provider. Delete the `kyc-documents`
   bucket rather than migrating it — you don't want that liability.
3. **Replace the money rails.** Per-user deposit addresses, a watcher that
   credits confirmed transactions automatically, and a real banking partner for
   the EUR account. Retire the manual ledger confirm.
4. **Write the legal pages** and stand up a monitored support address.
5. **Remove `mockLatency`** and the client-side notification timers.
6. **Then** set `DEMO_MODE = false`.

Step 6 last, on purpose. The notices are the only thing protecting someone from
acting on the illusion, so they come down after the illusion is gone — not
before.

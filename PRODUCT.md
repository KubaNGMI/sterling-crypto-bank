# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: self-directed retail crypto holders managing a personal portfolio —
checking balance, buying and selling a small set of major coins, and reviewing
spending, cash flow, and portfolio makeup on a dashboard.

Project intent: currently a learning project that the owner intends to launch and
grow as far as it can go. The near-term priority is a polished, presentable,
fully working product — every screen clean and coherent, every feature working
end to end. Real-world usability hardening (regulatory fitness, production-grade
auth flows, deep error/edge-case handling) is explicitly deferred for now.

## Product Purpose

Sterling Crypto Bank is a single web app that combines a crypto wallet (balances,
holdings, transaction history), an exchange (trade across supported assets), and
portfolio analytics (spending, cash flow, allocation). It positions itself as a
trustworthy financial ballast for people new to crypto — stability in a chaotic
market. For this phase, success means every
screen looks finished and coherent and every feature works end to end.

## Positioning

Undecided. No differentiating mechanism or market position has been established.
Future work must not invent one without the owner.

## Operating Context

- Authenticated dashboard behind a persistent sidebar shell. Routes: Dashboard,
  My Wallet, Analyze, Exchange, Profile, Settings — plus Login and a multi-step
  Create Account flow.
- New users complete a 5-step onboarding: Account → Location (citizenship /
  residence) → Source of Funds → Approximate Range → Proof-of-funds upload.
- Identity verification (Profile) collects a profile photo, government ID, selfie
  with ID, and bank statement; status is pending / approved / rejected.
- KYC and proof-of-funds files are stored in a Supabase `kyc-documents` storage
  bucket; profile and verification data live in `profiles` / `verifications`
  tables; balances are derived from a transactions table.
- Prices refresh client-side on a 60-second interval from the public CoinGecko
  API. Charts are rendered with Recharts. Stack is React 19 + Vite 8 +
  React Router 7, no TypeScript.

## Capabilities and Constraints

Locked constraints — preserve:

- Supabase is the backend for auth, file storage, and data.
- The 5-step KYC / source-of-funds / proof-of-funds flow is a required part of
  account creation.

Current implementation details — may change:

- The product is named **Sterling Crypto Bank** (renamed from "Chain" 2026-09-06).
  "Sterling" for short is the in-app wordmark. The ∞ mark / `Logo.svg` carries over.
- Price source is the public CoinGecko API (swappable).
- Supported assets — BTC, ETH, USDT, BNB, ADA, LUNA — are defined once in
  `src/coins.js` and read by the trade panel, Exchange, and My Wallet.
- Login's "Forgot Password" link is a placeholder (`href="#"`).
- Sign-up writes profile rows client-side and only works with Supabase email
  confirmation turned off (flagged as a known limitation in the code).

Terminology in use: holdings, cash flow, source of funds, proof of funds,
verification.

## Brand Commitments

Name is committed: **Sterling Crypto Bank** ("Sterling" short form). "Sterling"
evokes a trusted standard of quality — a financial ballast in chaotic crypto.
The ∞ mark and `Logo.svg` carry over. No committed voice, personality,
palette, or asset constraints.

## Evidence on Hand

- A working feature set across every listed route, with live CoinGecko pricing
  and real Supabase auth/storage wiring.
- Icon and logo SVGs in `src/assets/`; country list and real SVG country flags
  for the onboarding country picker.
- No real users, customers, testimonials, metrics, press, or case studies exist.
  Future work must not fabricate any.

## Product Principles

1. Polish and coherence first — every screen ships looking finished, with
   consistent spacing, type, color, and state handling. No rough edges in what
   is presented.
2. Everything works — no dead controls or broken flows in the presented surface.
   Defer scope rather than ship a half-working feature.
3. One source of truth for shared data (assets, balances, transactions) so a
   single change propagates everywhere it is shown.
4. Keep wallet, exchange, and analytics unified in one surface rather than
   splitting them into separate apps.
5. Treat the compliance-shaped onboarding as a real product feature, not
   throwaway scaffolding — while its regulatory sufficiency stays out of scope
   for this phase.

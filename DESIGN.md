---
name: Sterling Crypto Bank
description: A dark, data-forward crypto wallet, exchange, and portfolio dashboard seen through frosted glass.
colors:
  signal-indigo: "#6366f1"
  indigo-deep: "#4f46e5"
  indigo-light: "#8b8bff"
  void: "#0c0c14"
  deep-slate: "#121220"
  panel: "#171725"
  well: "#1c1c2e"
  hairline: "#26263a"
  paper: "#f4f4f8"
  muted-lilac: "#8b8b9e"
  gain-green: "#22c55e"
  loss-red: "#ef4444"
  bitcoin-amber: "#f7931a"
  glass-bg: "rgba(23, 23, 37, 0.55)"
  glass-bg-strong: "rgba(28, 28, 46, 0.65)"
  glass-border: "rgba(255, 255, 255, 0.09)"
  glass-highlight: "rgba(255, 255, 255, 0.06)"
  # Third-party token identity colors — used only for a coin's dot/logo chip,
  # never for UI. Not part of the interface palette.
  coin-eth: "#627eea"
  coin-luna: "#ffd83d"
  coin-bnb: "#f0b90b"
  coin-ada: "#0033ad"
  chart-amber: "#eab308"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  button:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
  stat:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  badge:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  xs: "8px"
  sm: "10px"
  md: "12px"
  lg: "18px"
  xl: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "15px"
  button-primary-hover:
    backgroundColor: "{colors.indigo-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "15px"
  button-auth:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "14px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.muted-lilac}"
    rounded: "{rounded.pill}"
    padding: "14px"
  input:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.glass-bg}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "28px"
  badge:
    backgroundColor: "{colors.glass-highlight}"
    textColor: "{colors.signal-indigo}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  nav-link-active:
    backgroundColor: "{colors.signal-indigo}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "11px 14px"
---

# Design System: Sterling Crypto Bank

## Overview

**Creative North Star: "The Quiet Exchange"**

Sterling Crypto Bank is a trading floor with the volume turned down. The surface is a near-black
indigo canvas lit only by two soft glow blobs drifting behind everything; frosted
glass panels float over it, each caught by a single hairline of light along its
top edge. Nothing on screen competes with the numbers. Chrome recedes, color is
rationed, and the eye lands on a balance figure or a price delta because that is
the largest, brightest thing in view.

The controls read like instruments, not toys. Borders are crisp single-pixel
strokes, focus is a quiet border-shift rather than a glow, transitions are short
and matter-of-fact (0.15s), and fills are flat `--accent` — the gradient buttons
and accent-glow shadows of the first draft have been retired. Two continuous
motions survive as signature, not decoration: the swap control's 180° flip and
the wallet's slow orbit, both now guarded by `prefers-reduced-motion`. The
direction stays calm: flat fills, diffuse depth, restraint.

Depth is atmospheric. It comes from translucency, a 24px backdrop-blur, and the
colored haze behind the glass — never from hard shadows. A card at rest looks
like it is sunk into fog, not stamped onto paper.

**Key Characteristics:**
- Near-black indigo canvas (`#0c0c14`) with two fixed ambient glow blobs — indigo
  top-left, green bottom-right — blurred 90px.
- Frosted glass cards: `backdrop-filter: blur(24px) saturate(180%)`, 9%-white
  border, a `::before` top light-line.
- One interactive hue: Signal Indigo `#6366f1`. Everything else is neutral or a
  financial semantic.
- Green / red carry polarity only; Bitcoin Amber marks BTC, withdrawals, and
  pending status.
- Data-forward: large tabular monetary figures, borderless rules-only tables,
  minimal surrounding chrome.
- Instrument controls: hairline borders, `:focus-within` border-shift, 0.15s
  transitions.

## Colors

A monochrome indigo-black field with a single indigo accent, plus a tightly
scoped set of financial semantics.

### Primary
- **Signal Indigo** (`#6366f1`): the only non-semantic color permitted on a
  screen. Interactive text and icons, active nav, focused field borders, selected
  states, the Buy/Sell pill, chart series 1, links, and the brand mark's context.
- **Indigo Deep** (`#4f46e5`): the hover state for every solid indigo fill
  (buttons, the swap control).
- **Indigo Light** (`#8b8bff`): highlight end of the avatar and orbit-bubble
  gradients only.

### Neutral
- **Void** (`#0c0c14`): app background, behind everything.
- **Deep Slate** (`#121220`): the sidebar panel.
- **Panel** (`#171725`): the opaque source color behind glass (`glass-bg` is this
  at 55%), and solid auth cards.
- **Well** (`#1c1c2e`): recessed surfaces — auth inputs, dropdown panels,
  selectable-card backgrounds.
- **Hairline** (`#26263a`): every 1px divider, table rule, orbit ring, and solid
  border.
- **Paper** (`#f4f4f8`): primary text; a cool near-white, never pure `#fff`
  except on filled indigo.
- **Muted Lilac** (`#8b8b9e`): secondary text, field labels, table headers,
  placeholders, inactive nav.

### Semantic
- **Gain Green** (`#22c55e`): positive amounts, income, price up, deposit badge,
  the SE ambient blob, chart series 2.
- **Loss Red** (`#ef4444`): negative amounts, price down, sell badge, error
  accents.
- **Bitcoin Amber** (`#f7931a`): BTC brand contexts, withdrawal badge, pending
  verification status, prototype notices.

### Token identity colors
Each coin carries its own brand color, used **only** for its dot / logo chip in
market tables and the portfolio donut — never for interface elements. ETH
`#627eea`, LUNA `#ffd83d`, BNB `#f0b90b`, ADA `#0033ad`, BTC reuses Bitcoin Amber.
The donut's categorical fallback palette adds `#eab308`. These are outside the
interface palette by design; do not pull them into UI.

### Named Rules
**The One Hue Rule.** Signal Indigo is the only decorative color on any view.
Green, red, and amber appear *only* to carry financial or status meaning — never
to add visual interest. Token identity colors are exempt: they belong to the
coin, not the interface.

**The Token Pair Rule.** Positive is `--green` (`#22c55e`), negative is `--red`
(`#ef4444`) everywhere, feedback text included — with matching
`rgba(34,197,94,·)` / `rgba(239,68,68,·)` tint fills. Don't reach for the
brighter `#4ade80` / `#f87171` pair; it isn't a second palette.

## Typography

**Body Font:** Inter, with `system-ui`, `-apple-system`, `sans-serif` fallback.

**Character:** One neutral grotesque doing every job. Personality comes from
weight and size contrast — heavy figures against light muted labels — not from
multiple families. There is no display or mono face. Inter is loaded from Google
Fonts at weights 400 / 500 / 600 / 700.

All figures render with `font-variant-numeric: tabular-nums` (set on `body`) so
columns of money and market data don't jitter.

### Hierarchy
- **Display** (700, 32px, 1.1): the single hero monetary figure on a view —
  `.balance-total` on My Wallet.
- **Headline** (700, 26px, 1.2): card totals (`.wallet-total`,
  `.spending-total`). Page titles (`<h1>` in the topbar) share the 26px size at
  weight 600, with the trailing word in Signal Indigo.
- **Stat** (700, 22px): the four-up metric values on Analyze (`.summary-value`) —
  one step below a card total.
- **Title** (600, 17px): section headings inside cards (`.market-title`).
- **Button** (600, 15px): primary action labels; secondary/compact buttons run
  14.5px.
- **Body** (500, 14px, 1.5): table cells, holdings rows, general copy. Inputs run
  slightly larger at 14.5px.
- **Caption** (400, 13px): sub-labels and helper text under a `.label`
  (`.add-funds-sub`, `.settings-hint`, empty-state hints).
- **Label** (500, 12.5px, 0.04em): field labels, table headers, chart captions,
  supporting `.label` text — always in Muted Lilac.
- **Badge** (700, 11.5px, 0.04em, uppercase): type / status pills.

The scale is dense by incumbent habit; 12px and 13.5px also appear in a few
places. New work should land on a named step above rather than adding another.

### Named Rules
**The Figure-First Rule.** The monetary total is the largest type on its view
(26–32px / 700). Every label around it drops to 12.5px Muted Lilac. Hierarchy is
carried by the numbers, not by headings.

## Layout

A fixed 220px sidebar sits beside a fluid main column capped at 1400px and
centered, with `32px 40px` padding (`24px` below the 1000px breakpoint). Vertical
rhythm is a 24px gap between sections and rows; glass cards carry 28px of internal
padding, dropping to 22–24px on the compact summary cards.

Dashboard content is a two-column grid at asymmetric ratios — `1fr / 1.4fr` for
the wallet + spending row, `1.6fr / 1fr` for market + trade, and the same
`1.6fr / 1fr` split on Analyze and Exchange. The Analyze summary strip is a
4-column grid.

Breakpoints: **1000px** (all main grids collapse to one column, main padding
tightens), **900px** (summary grid → 2-up, wallet top row stacks, Profile grid
→ 1-up), **768px** (the nav switch — see below), **700px** (verification upload
grid → 1-up), **560px** (market table drops its Symbol + Market Cap columns,
Settings form stacks). Auth screens ignore the shell entirely: a single centered
card, 380px on Login, 420px on Create Account, over the same dark field with one
radial glow.

**Below 768px** the 220px sidebar is replaced by two fixed bars: a 58px glass
**top app bar** (brand left, account-menu button right — Setting / Profile /
Log Out in a dropdown sheet) and a **bottom tab bar** (the four primary routes,
icon over 12.5px label, active in Signal Indigo with a 2px top indicator).
`.main-content` gains top and bottom padding to clear both, plus
`env(safe-area-inset-*)`.

## Elevation & Depth

This system is **atmospheric**, not shadowed. Depth is produced by three things
working together: translucency (glass surfaces at 55–65% opacity), a heavy
backdrop blur (`blur(24px) saturate(180%)`), and two fixed radial glow blobs
behind the entire app (`body::before` indigo 480px top-left, `body::after` green
420px bottom-right, each `filter: blur(90px)`). The glow is what the glass has to
refract — remove it and the material collapses.

Shadows exist but stay soft and diffuse; they never draw a crisp edge.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 var(--glass-highlight)`):
  the default glass card — a wide dark haze plus a 1px inner top highlight.
- **Overlay** (`box-shadow: 0 12px 32px rgba(0,0,0,0.4)` → `0 16px 40px rgba(0,0,0,0.45)`):
  dropdown menus and select panels.
- **Auth card** (`box-shadow: 0 20px 60px rgba(0,0,0,0.35)`): the taller drop
  under solid auth cards.

Accent-colored glow shadows (`0 8px 24px rgba(99,102,241,·)`) were retired from
primary buttons and the swap control in the Quiet Exchange pass — do not
reintroduce them.

### Named Rules
**The Atmospheric Rule.** Depth comes from blur, translucency, and the ambient
blobs — never a hard drop shadow. Card shadows are wide and low-alpha; if a
shadow reads as a crisp edge, it is wrong.

## Shapes

The radius scale, largest to smallest: **20px** glass cards · **18px** solid
auth cards · **12px** the default control radius (inputs, buttons, toggles, coin
fields, dropdown panels, mobile chrome) · **10px** compact controls (nav links,
icon buttons, the topbar search box, chart tooltips) · **8px** small inner
elements (menu option rows, feedback strips, scrollbar thumb) · **full pill**
(`999px`) for type/status badges and the auth CTA buttons. Circles are reserved
for avatars, orbit bubbles, the swap control, legend dots, and step indicators.

Borders are 1px hairlines throughout: `--border` (`#26263a`) on opaque surfaces,
`--glass-border` (9% white) on glass. Dropzones use a 1.5px dashed hairline. The
recurring custom geometry is the concentric-ring-and-orbiting-dot motif of
WalletOrbit.

### Named Rules
**The Radius Scale Rule.** New work uses one of the six steps above — 20 / 18 /
12 / 10 / 8 / pill. The working triad for most surfaces is **20px card, 12px
control, pill badge**; reach for 10px or 8px only to match an existing compact
neighbour.

## Components

### Buttons
- **Shape:** 12px radius (rectangular actions), full pill (auth actions).
- **Primary (dashboard) — `.buy-btn`, `.add-funds-btn`, `.submit-btn`:** flat
  `var(--accent)` fill, white text, ~15px padding, 15px/600, `transition:
  background 0.15s`, hover → `#4f46e5`, disabled `opacity: 0.5`. No gradient, no
  glow, no hover lift — flattened in the Quiet Exchange pass.
- **Primary (auth) — `.login-btn`:** flat `var(--accent)`, pill, 14px padding,
  15px/700, trailing `›` arrow, hover → `#4f46e5`.
- **Secondary / Back — `.back-btn`:** transparent, 1px `--border`, Muted Lilac
  text, pill; hover brightens text and shifts the border to accent.
- **Quiet button** (`.empty-state__action`, `.market-retry`): transparent, 1px
  `--glass-border`, accent text, 12px radius; hover borders accent + faint white
  fill. The low-commitment action inside an empty or error state.
- **Buy/Sell toggle:** a `.toggle-pill` in solid `--accent` slides behind two
  label buttons on `cubic-bezier(0.65,0,0.35,1)` over 0.3s; inactive label Muted
  Lilac, active `#fff`.
- **Swap control — `.swap-icon`:** 32px accent circle, white glyph; hover →
  `#4f46e5` + `rotate(180deg)` (0.2s), guarded by `prefers-reduced-motion`. Flat
  since the pass — the glow shadow is gone.
- **Icon button — `.icon-btn`:** 40×40, 10px radius, glass background + blur,
  Muted Lilac glyph.

### Cards / Containers
- **Corner:** 20px (glass), 18px (solid auth).
- **Background:** `--glass-bg` over the ambient field; `--card-bg` for auth.
- **Shadow:** see Elevation — card-rest haze plus inner top highlight, and the
  `::before` top light-line gradient.
- **Border:** 1px `--glass-border`.
- **Padding:** 28px default; 22–24px on compact/summary variants.

### Inputs / Fields
- **Dashboard style:** `rgba(255,255,255,0.04)` fill, 1px `--glass-border`, 12px
  radius, 12–16px padding.
- **Auth style:** `--card-bg-alt` fill, 1px `--border`, 10px radius, a leading
  emoji/icon inside the field.
- **Focus:** `:focus-within` shifts the border to `--accent` in 0.15s. Coin
  inputs also lift the fill to `rgba(255,255,255,0.06)`. No glow, no ring.
- **Search box (topbar):** glass fill + blur, 10px radius, fixed 220px, leading
  🔍.

### Select (custom — `Select.jsx`)
Borderless inline trigger text with a `⌄` chevron that rotates 180° and turns
accent on open. Panel: `--card-bg-alt`, 12px radius, `0 16px 40px rgba(0,0,0,0.45)`
shadow, `ui-select-pop` 0.14s entrance. A bottom-bordered search input; option
rows at 8px radius — highlighted = 6% white wash, selected = accent text + `✓`.
Custom 8px scrollbar with an accent thumb on hover. The `CoinSelect` variant in
TradePanel is the same pattern with a glass (`rgba(28,28,46,0.85)` + blur) menu.

### Tables (`.market-table`, `.history-table`)
Borderless, rules only. Header cells: 12.5px Muted Lilac, weight 500, left
aligned, bottom hairline. Body cells: 14px, 14–16px vertical padding, per-row
bottom hairline (removed on the last row). Numeric cells take semantic color —
green for up / positive, red for down / negative. Ticker symbols render in
`--accent` at weight 600.

### Badges
- **Type badge** (buy / sell / deposit / withdrawal): 15%-opacity semantic fill
  with matching text color, 11.5px/700 uppercase, full pill. buy → indigo,
  sell → red, deposit → green, withdrawal → amber.
- **Status badge** (pending / approved / rejected): identical pattern —
  amber / green / red.

### Navigation — desktop rail (`.sidebar`)
220px, `linear-gradient(180deg, rgba(100,115,254,0.10), transparent 45%)` over
`--sidebar-bg`, right hairline border. Logo lockup: the infinity SVG mark +
"Sterling" at 18px/700. Links: Muted Lilac at 14.5px, 12px gap, 10px radius, an
18px inline SVG icon (`currentColor`, ~1.1 stroke) that recolors with the label;
hover brightens text over a `--card-bg` fill that bleeds to the panel edges;
**active** = white text on `linear-gradient(270deg, #6473FE, transparent)`,
square corners, full-bleed. Bottom group (Setting, Profile, Log Out) sits under a
top hairline.

### Navigation — mobile bars (`< 768px`)
- **Top app bar** (`.mobile-appbar`): fixed, 58px + safe-area, glass
  (`glass-bg-strong` + `blur(20px) saturate(180%)`), bottom hairline. Brand
  lockup left; a 38px glass menu button right (12px radius) that turns its
  border + icon accent when open.
- **Account sheet** (`.mobile-menu`): drops from under the app bar, right-aligned,
  `--card-bg-alt`, 12px radius, overlay shadow, `mobile-menu-pop` 0.14s. Rows:
  Setting / Profile / Log Out, 14px, 8px radius, 6%-white hover. A transparent
  full-screen backdrop closes it.
- **Bottom tab bar** (`.mobile-tabbar`): fixed, glass, top hairline, safe-area
  bottom padding. Four equal tabs (Dashboard / My Wallet / Analyze / Exchange),
  each a 20px icon over a 12.5px/600 label; rest Muted Lilac, **active** Signal
  Indigo with an 18×2px accent indicator pinned to the tab's top edge.

### Charts (Recharts)
Area charts: a vertical `linearGradient` fill from the series color at 0.35 alpha
to 0, a 2px stroke, `type="monotone"`. Spending uses Gain Green; cash-flow bars
color per sign (green positive, red negative). Tooltip is a mini glass card:
`rgba(23,23,37,0.85)` + `blur(12px)`, 1px `--border`, 10px radius, uppercase
Muted Lilac day label above a 16px/700 amount. Donut: `innerRadius 60`,
`outerRadius 90`, `paddingAngle 3`, categorical palette
`#6366f1, #22c55e, #f7931a, #ef4444, #eab308`, with a custom legend of 9px dots.

### WalletOrbit (signature component)
Three concentric 1px `--border` rings (300 / 210 / 120px), four static Muted
Lilac dots, and two counter-rotating orbit tracks (`spin` 14s and 9s-reverse,
with a `counter-spin` keeping the coin bubbles upright). Coin bubbles are
indigo-gradient circles (ETH 64px, BTC 48px) around a central wallet-icon bubble.
The rotation is guarded by `prefers-reduced-motion` (it stops, it doesn't
restyle).

### Empty state (`EmptyState.jsx`)
The one pattern for a card with no data yet. Centered column: a 44px rounded
(12px) chip holding a 20px drawn line-icon (Muted Lilac), a 14px/600 title, an
optional 12.5px Muted Lilac hint capped at ~34ch, and an optional quiet-button
action — a router link or an `onClick` (used for "Try again" in the market
error state). Icons are authored inline SVG (`currentColor`, ~1.1 stroke), never
emoji.

### Loading skeleton (`CardLoading.jsx`)
Replaces the orphan "Loading…" line inside a fetching card. 3–5 stacked 16px bars
at 8px radius, staggered widths, a 1.4s left-to-right shimmer
(`rgba(255,255,255,0.03→0.07→0.03)`), `role="status"`, `min-height: 216px` so it
occupies the same box the real content will. Also guarded by
`prefers-reduced-motion`. The market table has its own inline variant that keeps
the section title visible above the bars.

### Perceived pacing
This is a finance surface — it should feel considered, not twitchy.
- **A calm beat on load.** The data hooks (`useTransactions`, `useCryptoPrices`,
  the market fetch) hold their loading state a minimum ~450ms
  (`withMinDuration`) so content settles rather than flash-popping. Never slower
  than the network actually is — a floor, not an added delay. Background 60s
  refreshes are not floored.
- **Content settles, it doesn't jump.** `CardLoading` and `EmptyState` share a
  216px min-height, so loading → data / empty is a swap in place. The post-load
  content carries `.settle` — one 260ms `cubic-bezier(0.16,1,0.3,1)` fade + 6px
  rise, once.
- **Routes cross-fade.** The `.main-content` child is keyed by pathname and
  carries `.route-fade` — a 180ms opacity fade so navigation doesn't hard-cut.
- **Scroll stays glassy.** `scroll-behavior: smooth`; the ambient blobs and every
  `.card` are promoted to their own compositor layer (`translateZ(0)`) so the
  backdrop blur is not re-rasterised each scroll frame.
- All of the above collapse under `prefers-reduced-motion`.

### Confirm panel (`ConfirmPanel.jsx`)
The review beat before a money action commits — Buy/Sell, Add Funds, and every
admin ledger entry. Replaces the primary button with a bordered
`rgba(255,255,255,0.03)` panel: a 13px Muted Lilac title, label/value rows
(right-aligned values, 13.5px), then **Back** (ghost, `flex: 1`) beside
**Confirm** (accent, `flex: 2`). Shows a "Processing…" busy state on the
confirm. The form behind it is frozen (`<fieldset disabled>`) so what you
confirm is what you reviewed.

### Status pill (`StatusPill.jsx`)
Account state as the badge pattern — 15%-tint fill, matching text, 11.5px/700
uppercase, full pill. `verified` green, `pending` orange, `rejected` /
`suspended` red, `unverified` a neutral 6%-white chip. Same styling as the
transaction type badges; only the vocabulary differs.

### Verify gate (`VerifyGate.jsx`)
A locked variant of the empty state that stands in for a whole feature card when
the account isn't `verified` (admins pass through). Lock glyph in the 44px chip,
title, one-line reason, and — unless review is already pending — a quiet link to
`/profile`. Same `.card` slot, same min-height, so layout doesn't jump.

### Admin console (Operate surface)
The `/admin` route reuses the whole system; three patterns are specific to it:

- **Data table** (`.admin-table`): denser than the market/history tables (13–14px
  rows, per-row bottom hairline). Whole rows are clickable to open a detail view;
  a right-aligned action cell holds **ghost buttons** and stops click
  propagation.
- **Ghost button** (`.ghost-btn`): transparent, 1px `--glass-border`, Muted Lilac
  text, 10px radius; hover brightens text and shifts the border to `--accent`.
  The tertiary action — below the quiet empty-state button in emphasis. Use
  `--accent` text for the affirmative one (e.g. "Verify").
- **Segmented switch** (`.admin-tabs`, `.op-switch`): options in a
  4%-white / hairline track; the active one is a solid `--accent` fill at 8px
  radius. Same family as the Buy/Sell toggle, used here for view + form-mode
  switching.
- **Slide-over drawer** (`.drawer`): right-anchored panel (`min(440px, 100%)`)
  over a `rgba(4,4,10,0.55)` + `blur(2px)` scrim, `--sidebar-bg` surface, left
  hairline, 0.18s slide-in, Esc / backdrop to close. Sections divided by top
  hairlines. For record detail, not for tasks that deserve their own page.

## Do's and Don'ts

### Do:
- **Do** compose every surface from the glass `.card` over the dark ambient-blob
  body, and keep the `::before` top light-line.
- **Do** keep Signal Indigo (`#6366f1`) for interactive and brand use only;
  green / red for financial polarity, amber for BTC / withdrawal / pending.
- **Do** color monetary deltas by sign and use the 15%-tint pill for every
  type / status badge.
- **Do** make `:focus-within` border-shift to `--accent` the single focus
  treatment, and keep state transitions at 0.15s.
- **Do** hold the layout frame: 1400px max width, 220px sidebar / mobile bars
  below 768px, 24px section gap, 28px card padding.
- **Do** set the monetary figure as the largest type on its view (26–32px / 700).
- **Do** give every fetching card a `CardLoading` skeleton and every no-data card
  an `EmptyState` — never an orphan "Loading…" / "None yet" line.
- **Do** draw icons as inline SVG (`currentColor`, ~1.1 stroke); the incumbent
  emoji glyphs are legacy, not the pattern for new work.
- **Do** keep the deliberate feel: floor loads at ~450ms, `.settle` post-load
  content in place, and route a money action through `ConfirmPanel` before it
  writes.

### Don't:
- **Don't** add a radius outside the six-step scale (20 / 18 / 12 / 10 / 8 /
  pill); default to the 20 / 12 / pill triad.
- **Don't** use the brighter `#4ade80` / `#f87171` pair — feedback text is
  `--green` / `--red`, with matching `rgba(34,197,94,·)` / `rgba(239,68,68,·)`
  tints.
- **Don't** reach for gradient fills or accent-glow shadows — primary buttons and
  the swap control are flat `--accent`, hover `#4f46e5`. The Quiet Exchange keeps
  them that way.
- **Don't** ship an animation without a `prefers-reduced-motion` guard (the orbit,
  the skeleton shimmer, and the swap rotate each have one).
- **Don't** resurrect `src/App.css` (deleted — was unused Vite-template
  leftovers), and keep `favicon.svg` on the infinity / chain lockup, not a
  stray mark.

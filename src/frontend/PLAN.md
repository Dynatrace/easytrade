# Refactoring Plan

Goal: strip the frontend to a minimal, bespoke dark-theme UI with no general-purpose UI library, as few dependencies as possible, and no broken-requirement churn.

**Background reading** (context behind the decisions in this plan):
- [DEPENDENCIES.md](DEPENDENCIES.md) — full audit of every runtime dependency: what it does, where it is used, and whether it should be removed

---

## Stage 1 — Dead weight removal (no UI changes)

Remove four dependencies that are either unused or trivially inlineable. No component rewrites needed.

- Remove `@mui/x-date-pickers` — zero imports in the codebase
- Remove `luxon` → replace the single `DateTime` call in `transactions.ts` with `Intl.DateTimeFormat`
- Remove `usehooks-ts` → inline a `useSessionStorage` hook (~10 lines) in `AuthContext/storage.ts`
- Remove `validator` → replace `isCreditCard` calls in `DepositForm` and `WithdrawForm` with an inline validation function

---

## Stage 2 — Ground-up UI rewrite

The previous frontend was designed with MUI in mind, resulting in a layout and component structure that inherited MUI's assumptions. The goal is **not** to port that design into custom components — it is to write a new UI starting from what the app actually needs to do.

**Design constraints (loadgen-first):**
- Every interactive element the loadgen targets must have a stable, unambiguous `id` or `data-testid` — no relying on text content or positional selectors
- No animations, transitions, or elements that overlap or animate into position — these cause Puppeteer to click the wrong target or wait unnecessarily
- Forms use plain `<input>`, `<select>`, `<button>` — no custom dropdowns, no floating labels, no date pickers
- Pages load only what they need — route-based code splitting from the start (dynamic `import()` per route) so each Puppeteer visit loads the smallest possible JS chunk
- **Element tag type is part of the selector contract** — `//div[@id="cardType"]`, `//li[@id="logoutItem"]`, `//p[@id="order-id"]`, `//h5[@id="instrumentPrice"]` target specific HTML tags; changing the tag breaks the loadgen even if the `id` is preserved. Either keep the same tags or update `selectors.ts` in lockstep.
- **Tab buttons have IDs** — tab buttons render as `<button id="quickBuyTab">`, `<button id="quickSellTab">`, `<button id="buyTab">`, `<button id="sellTab">`. Loadgen selectors change from text-match to ID-match.
- **Static sidebar requires a loadgen co-change** — the current loadgen calls `showNavbar()` which looks for `#navigationToggler` to open the drawer. With a static sidebar, `#navigationToggler` is removed and `showNavbar()`/`hideNavbar()` become no-ops. Nav links gain explicit IDs (`nav-home`, `nav-deposit`, etc.) replacing href-based selectors. Full list of selector and helper changes: [NEW_FLOW.md](NEW_FLOW.md).
- **Per-view element spec and loadgen impact** — [VIEWS_PLAN.md](VIEWS_PLAN.md) lists every element for every view with its `id`, tag, and loadgen impact. [NEW_FLOW.md](NEW_FLOW.md) lists the exact `selectors.ts` and helper changes required. [OLD_FLOW.md](OLD_FLOW.md) documents the current loadgen step sequence as a regression baseline.
- **All `data-dt-*` attributes must be preserved** — they are Dynatrace instrumentation, not loadgen selectors, but they are what makes this app observable. The full set in use: `data-dt-features` (on instruments grid, tables, charts), `data-dt-name` / `data-dt-children-name` (on instrument cards and price display), `data-dt-mouse-over` (on charts and feature flag items), `data-dt-content` (on form fields), `data-dt-mask` (on PII fields: user name, credit card status entries), `data-dt-properties` (on root layout for theme tracking).

**Design constraints (maintainability):**
- Single dark theme hardcoded in CSS variables — no runtime theme switching, no ThemeContext
- Layout via plain CSS grid and flexbox — no layout abstraction components (`Stack`, `Box`, `Grid`)
- Only build components that are actually used — no generic component library

**What to build:**

*Auth*
- **Login page** — two-column layout: left column is the login form (`id="login"`, `id="password"`, `id="submitButton"`); right column is a preset-user quick-select (dropdown + submit). Loadgen uses the left column only. No animations between the two sides.

*Shell*
- **Static sidebar nav** — 5 links (Home, Instruments, Deposit, Withdraw, Credit Card). Always visible, no hamburger toggle, no drawer animation. Replaces the current MUI Drawer + `#navigationToggler` open/close flow that the loadgen has to navigate around.
- **Header strip** — logo + profile button `id="profileToggler"` + logout item `id="logoutItem"`. No theme switcher (single dark theme).

*Dashboard (Home page)*
- **Balance display** — read-only field `id="currentBalance"`. Loadgen reads this value before calculating trade amounts. Keep as a plain, always-visible text element.
- **Owned instruments table** — plain `<table>` with columns: Code, Name, Amount, Price, Total. Replaces `DataGrid`. No column-visibility picker or quick-search — the loadgen never uses those controls.
- **Transactions table** — plain `<table>` with columns: Direction, Status, Instrument, Amount, Price, Total, End time. Paginated. Replaces `DataGrid`.
- **Charts** — replace the current snapshot bar chart (amount + value per stock at this moment) with a **portfolio value over time** line chart, defaulting to a 1-day window. Two implementation options depending on scope:

  **Option A — no schema change (derive from existing data)**
  Replay `Trades` (timestamped buy/sell records already in the DB) to compute running quantity per instrument at each point, then multiply by `Pricing.Close` at that timestamp. 100% accurate, zero DB changes. The computation is heavier but acceptable for demo-scale data volumes. New broker-service endpoint only.

  **Option B — add `OwnedInstrumentsHistory` table (write-through cache)**
  On every trade, broker-service inserts a row `(AccountId, InstrumentId, Quantity, Timestamp)` alongside the existing `OwnedInstruments` upsert. The portfolio history endpoint becomes a single join against pricing instead of a trade replay. Preferred if the endpoint becomes a hot path.

  Either option uses the same frontend contract — `GET /broker-service/v1/portfolio/history/{accountId}?period=1d` returning `{ timestamp, totalValue }[]`. The default period is **1 day**; the frontend passes a configurable window (1d / 7d / 30d). The response shape does not change between options, so the frontend only needs to be built once.

  The two pie charts (transaction status + direction breakdown) are lower priority and can be kept as-is or dropped.

*Instruments*
- **Instruments grid** — grid of clickable instrument cards. Each card must keep CSS classes `instrument-card` (all cards) and `owned-instrument` (cards where amount > 0) — the loadgen's XPath targets `//div[contains(@class, "instrument-card")]` and `//div[contains(@class, "owned-instrument")]`.
- **Instrument detail** — price header with `id="instrumentName"` and `id="instrumentPrice"` (rendered as `<h5>` — tag must match selector `//h5[@id="instrumentPrice"]`). Below that: a tab panel with four forms. Tab buttons: `<button id="quickBuyTab">`, `<button id="quickSellTab">`, `<button id="buyTab">`, `<button id="sellTab">` — no animated tab indicator.

*Trade forms (all loadgen-critical — field IDs and element tags must be preserved)*
- **Quick Buy** — `id="amount"` (`<input>`), `id="price"` (`<input>` readonly), `id="currentBalance"` (`<input>` readonly), total display, `id="submitButton"` (`<button>`).
- **Quick Sell** — `id="amount"` (`<input>`), `id="price"` (`<input>` readonly), `id="posessedAmount"` (`<input>` readonly — note the typo must be kept to avoid breaking the loadgen selector), total display, `id="submitButton"` (`<button>`).
- **Buy / Sell (scheduled)** — `id="amount"` (`<input>`), `id="price"` (`<input>`), `id="time"` (`<input>`), readonly total, autofill shortcuts, `id="submitButton"` (`<button>`).
- **Deposit / Withdraw** — `id="amount"`, `id="cardholderName"`, `id="address"`, `id="email"`, `id="cardNumber"`, `id="cardType"` (native `<select>` — replaces the MUI `<div>` + portal `<li>` pattern; `depositPage_cardType`, `depositPage_cardType_provider`, and `depositPage_submit` selectors updated, `selectCardProvider()` helper rewritten), `id="cvv"` (Deposit only), `id="agreement"` (`<input type="checkbox">`), `id="autofillButton"`, `id="submitButton"`.

*Credit card flow*
- **Order form** — `id="name"`, `id="address"`, `id="email"`, `id="type"` (native `<select>` — `creditCardPage_cardTypeInput`, `creditCardPage_cardType_type` selectors updated, `orderCard()` helper rewritten), `id="agreement"` (`<input type="checkbox">`), autofill button, `id="submitButton"`.
- **Status timeline** — read-only ordered list of status steps with timestamps. Contains `id="order-id"` (`<p>` tag — loadgen reads it via `//p[@id="order-id"]`). Fields with PII need `data-dt-mask`. Replaces MUI `Timeline` with a plain `<ol>`.
- **Active card / revoke** — message + `id="revoke-card"` (`<button>`).

*Admin*
- **Feature flags page** — list of toggleable flags with enable/disable buttons. Not loadgen-critical; can be a simple list with inline status text instead of MUI accordion + Snackbar.

*Shared*
- **Inline SVG icons** — 11 icons currently used (menu, home, wallet, card, euro, flag, dark/light mode, logout, build, check, close, sync). Inline as React components or a single sprite.
- **Status/error display** — inline text element for form feedback. No toast or Snackbar.

**What not to carry over:**
- No Drawer/AppBar pattern — sidebar nav can be static
- No Snackbar/toast system — inline status messages suffice for the loadgen's interaction flow
- No `CircularProgress` spinner abstraction — a CSS `@keyframes` rule is enough

**Removed packages:**
`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/system`, `@mui/x-data-grid`, `@emotion/react`, `@emotion/styled`, `react-hook-form-mui`, `react-hook-form`, `@hookform/resolvers`, `zod`

---

## Stage 3 — Post-MUI evaluation

With MUI gone, two remaining decisions:

1. **`react-hook-form` + `@hookform/resolvers` + `zod`** — removed in Stage 2. For any validation that is still needed, the choice is between:
   - **Manual validation functions** — no dep, fewest lines for simple field checks.
   - **[valibot](https://valibot.dev/)** — API similar to zod but ~10× smaller (~5 KB vs ~50 KB); worth it only if multiple schemas are needed.
2. **`recharts`** — ~400 KB is too heavy for three charts. Replace with a lighter alternative:
   - **[Lightweight Charts](https://github.com/tradingview/lightweight-charts)** (TradingView) — ~40 KB, purpose-built for financial time-series; fits the stock-trading context perfectly
   - **[uplot](https://github.com/leeoniya/uplot)** — ~15 KB canvas-based, fastest option, minimal API
   - **[Chart.js](https://www.chartjs.org/)** — ~40 KB, widely known, React wrapper via `react-chartjs-2` adds ~5 KB

   Recommendation: **Lightweight Charts** — smallest footprint for the use-case, no React wrapper needed, maintained by TradingView.
3. **`@tanstack/react-query-devtools`** — gate behind `import.meta.env.DEV` so it is tree-shaken from the production build.

---

## Target dependency list

| Package | Reason |
|---|---|
| `react` + `react-dom` | Core framework |
| `react-router` | SPA routing with loader-based data fetching |
| `@tanstack/react-query` | Server state — caching, mutations, query invalidation across 30+ call sites |
| `fast-xml-parser` | loginservice communicates over XML; removable only if loginservice is migrated to JSON |
| `lightweight-charts` *(replaces `recharts`)* | Financial time-series charts — ~40 KB vs ~400 KB; purpose-built for trading data |
| `valibot` *(optional, replaces `zod`)* | Form validation — only if manual inline checks prove insufficient; ~5 KB vs zod's ~50 KB |

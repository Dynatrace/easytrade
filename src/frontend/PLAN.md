# Refactoring Plan

Goal: strip the frontend to a minimal, bespoke dark-theme UI with no general-purpose UI library, as few dependencies as possible, and no broken-requirement churn.

**Background reading** (context behind the decisions in this plan):
- [DEPENDENCIES.md](DEPENDENCIES.md) — full audit of every runtime dependency: what it does, where it is used, and whether it should be removed
- [SIMPLIFYING_UI.md](SIMPLIFYING_UI.md) — measured data showing that UI simplification (no animations, no dropdowns) does not reduce headless browser resource usage; the cost is Chrome itself
- [NEXTJS_MIGRATION.md](NEXTJS_MIGRATION.md) — why migrating to Next.js was evaluated and rejected; also covers the Puppeteer → Playwright question

---

## Stage 1 — Dead weight removal (no UI changes)

Remove four dependencies that are either unused or trivially inlineable. No component rewrites needed.

- Remove `@mui/x-date-pickers` — zero imports in the codebase
- Remove `luxon` → replace the single `DateTime` call in `transactions.ts` with `Intl.DateTimeFormat`
- Remove `usehooks-ts` → inline a `useSessionStorage` hook (~10 lines) in `AuthContext/storage.ts`
- Remove `validator` → replace `isCreditCard` calls in `DepositForm` and `WithdrawForm` with an inline Zod refinement

---

## Stage 2 — Decouple forms from MUI (prerequisite for Stage 3)

Remove `react-hook-form-mui` by replacing its `FormContainer`, `TextFieldElement`, and `SelectElement` wrappers with plain `<input>` and `<select>` elements wired to `react-hook-form` directly. This breaks the hard MUI dependency in all 10 form files before the full MUI removal, making Stage 3 a pure component-swap rather than a form-logic rewrite.

---

## Stage 3 — Replace MUI with bespoke component set

The core of the ticket. Remove the entire MUI stack and build a small, app-specific set of components styled with CSS (variables or modules), dark theme only.

**Components to build:**
- `Button`, `Input`, `Select`, `Checkbox` — replaces MUI form primitives
- `Card` — replaces `Card`, `CardContent`, `CardHeader`, `CardActions`
- `Table` — replaces `@mui/x-data-grid` (two tables in the app)
- `Tabs` — replaces `@mui/lab TabContext/TabList/TabPanel` (one usage)
- `StatusTimeline` — replaces `@mui/lab Timeline` (one usage; a styled `<ol>` suffices)
- `AppBar` / `Drawer` / `Navigation` — replaces MUI layout components
- `Alert`, `Snackbar` — replaces MUI feedback components
- `CircularProgress` — replaces MUI loading spinner
- `Typography` / layout primitives (`Stack`, `Box`) — replaces MUI layout helpers with CSS flex/grid
- Inline 11 SVG icons — replaces `@mui/icons-material`
- Single dark CSS theme via `ThemeContext` — replaces MUI `createTheme` / `ThemeProvider` / `CssBaseline`

**Removed packages:**
`@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/system`, `@mui/x-data-grid`, `@emotion/react`, `@emotion/styled`, `react-hook-form-mui`

---

## Stage 4 — Post-MUI evaluation

With MUI gone, two remaining decisions:

1. **`react-hook-form` + `@hookform/resolvers`** — evaluate whether native `onSubmit` + Zod parse is simpler than the full RHF stack for these forms. If native forms are chosen, also remove these two.
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
| `zod` | Form validation — schemas are type-safe, co-located, and reusable as API response validators |
| `react-hook-form` + `@hookform/resolvers` | Form state management — keep pending Stage 4 evaluation |
| `fast-xml-parser` | loginservice communicates over XML; removable only if loginservice is migrated to JSON |
| `lightweight-charts` *(replaces `recharts`)* | Financial time-series charts — ~40 KB vs ~400 KB; purpose-built for trading data |

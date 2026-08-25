# Frontend Dependency Audit

> Part of the refactoring research. Start with [PLAN.md](PLAN.md) for the full picture.

Requirements driving this analysis:
- No UI elements library — build a small bespoke set instead
- Single dark theme — no dynamic theming needed
- Every dependency must justify its presence
- Minimize deps to avoid broken-requirements churn

---

## Runtime Dependencies

| Dependency | Pros of removing | Cons of removing | Where used | Summary |
|---|---|---|---|---|
| `@mui/material` | Removes the entire reason Emotion exists; eliminates 53 files of MUI-specific layout/component imports; unlocks custom dark-theme-only component set | Largest single refactor in the codebase — every page, layout, and most components need rewriting | 53 files — every page, layout, component | **Remove.** Directly violates the "no UI library" requirement. Biggest ticket item. |
| `@mui/icons-material` | Removes ~1 500 bundled SVG icons compressed to just the ones used | Need to source/inline 11 icons as SVGs manually | AppHeader, Navigation, TransactionsTable, DepositForm, WithdrawForm, FeatureFlagItem, ThemeSwitcher, VersionInfo | **Remove with MUI.** Replace the 11 used icons with inline SVGs or a tiny icon sprite. |
| `@mui/lab` | Removes tab + timeline components with no replacement boilerplate required (tabs are trivial; timeline is a list with CSS) | Need to rewrite `InstrumentTransactions` tabs and `CreditCardStatusTimeline` | InstrumentTransactions.tsx, CreditCardStatusTimeline.tsx | **Remove with MUI.** Both use-cases are implementable with plain HTML + CSS. |
| `@mui/system` | Goes away automatically with MUI | Still need `styled` if keeping Emotion separately | DefaultLoginForm, LoginForm, DepositForm, WithdrawForm, NumberFormField | **Remove with MUI.** Zero reason to keep without MUI. |
| `@mui/x-data-grid` | Removes a heavy enterprise grid; plain `<table>` suffices for two use-cases | Need to rewrite InstrumentsTable and TransactionsTable | InstrumentsTable.tsx, TransactionsTable.tsx | **Remove with MUI.** Two tables don't justify a full data-grid library. |
| `@mui/x-date-pickers` | Smaller bundle, one less MUI package | None — **it is never imported anywhere in the codebase** | *(unused)* | **Remove immediately.** Dead dependency with zero usage. |
| `@emotion/react` | Smaller bundle; Emotion is only here because MUI requires it | MUI will not function without it at runtime | *(peer dep only — no direct imports)* | **Remove with MUI.** No standalone value. |
| `@emotion/styled` | Same as above | Same as above | *(peer dep only — no direct imports)* | **Remove with MUI.** No standalone value. |
| `react-hook-form-mui` | Eliminates the MUI↔RHF glue layer entirely | All 10 forms need their field components rewritten as plain inputs | QuickBuyForm, BuyForm, SellForm, QuickSellForm, DefaultLoginForm, SignupForm, LoginForm, DepositForm, WithdrawForm, CreditCardForm, NumberFormField | **Remove with MUI.** This lib only exists to bridge RHF with MUI components. |
| `@hookform/resolvers` | One less dep if the form stack is simplified | Required for `zodResolver` — the bridge between Zod schemas and RHF | All 10 form files | **Keep if keeping RHF + Zod.** Remove only if the whole form stack is replaced. |
| `react-hook-form` | Simpler code; native `onSubmit` + `FormData` or plain `useState` could work | Good uncontrolled form state; re-renders only changed fields; well-tested | All 10 form files | **Borderline.** The app's forms are simple enough for native handling. Worth revisiting after MUI is out, but not urgent. |
| `zod` | Fewer deps | Best-in-class schema validation; pairs tightly with RHF via resolvers | All 10 form files | **Keep.** Earns its place — validation logic is clean, co-located, and type-safe. No comparable native alternative. |
| `@tanstack/react-query` | Simpler code if fetch + `useState` is acceptable | Powers all data fetching, caching, mutations, and loader pre-population across the entire app | 30+ files across contexts, hooks, queries, loaders, and form components | **Keep.** Fully justified. Removing it would mean rewriting the entire data layer with no meaningful gain. |
| `@tanstack/react-query-devtools` | Smaller prod bundle | The dev panel is intentionally included for the Dynatrace observability demo context | ProviderLayout.tsx | **Borderline.** Could be gated behind a dev-mode check. Low priority. |
| `react-router` | — | Routing is fundamental; no realistic alternative for an SPA with 10+ routes and loaders | 24 files — all layouts, pages, navigation | **Keep.** Non-negotiable for a multi-page SPA. |
| `react` + `react-dom` | — | Core framework | Every component file | **Keep.** Non-negotiable. |
| `fast-xml-parser` | Removes XML dependency entirely | `loginservice` speaks XML — removing this requires changing the loginservice API or auth layer | api/backend/creditCard.ts, api/backend/prices.ts, api/price/price.ts, api/creditCard/order/index.ts | **Keep for now.** Justified as long as loginservice uses XML. Becomes removable if loginservice is migrated to JSON. |
| `recharts` | Removes a ~400 KB library; charts are decorative not functional | Home and Instrument pages lose price/transaction visualisations | InstrumentsChart.tsx, TransactionsPieChart.tsx, InstrumentPriceChart.tsx | **Borderline.** Charts are useful for the demo's visual appeal but not core functionality. Could be replaced with a lighter library or Canvas. |
| `luxon` | `Intl.DateTimeFormat` + `Date` methods cover the single use-case | Nicer API than raw `Intl` | api/transaction/transactions.ts (one file, `DateTime` for timestamp formatting) | **Remove.** Single-file usage of one feature. Replace with `new Intl.DateTimeFormat(...).format(new Date(ts))` — about 2 lines. |
| `usehooks-ts` | One less dep; the hook is trivial to inline | Slightly cleaner code | contexts/AuthContext/storage.ts (one file, `useSessionStorage`) | **Remove.** `useSessionStorage` is ~10 lines of native `useState` + `sessionStorage`. Not worth a full library. |
| `validator` | Smaller bundle; CC validation is a one-liner regex or Zod refinement | Dedicated, well-tested CC validation logic | DepositForm.tsx, WithdrawForm.tsx (`isCreditCard` only) | **Remove.** Replace with `z.string().refine(val => /^[0-9]{13,19}$/.test(val.replace(/\s/g, '')))` or Luhn check inline. |

---

## DevDependencies

These are build/test time only and don't affect the production bundle. Requirements don't apply here directly, but they're listed for completeness.

| Dependency | Purpose | Status |
|---|---|---|
| `vite` + `@vitejs/plugin-react-swc` | Build tool + fast SWC-based React transform | **Keep.** Best-in-class build tooling. |
| `typescript` | Type checking | **Keep.** |
| `vitest` | Test runner | **Keep.** |
| `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` | Component testing utilities | **Keep.** |
| `jsdom` | Browser DOM simulation for Vitest | **Keep.** |
| `eslint` + plugins | Linting | **Keep.** |
| `prettier` | Formatting | **Keep.** |
| `globals` | ESLint global var sets | **Keep.** |
| `@types/react`, `@types/react-dom`, `@types/luxon`, `@types/validator` | TypeScript types | **Remove `@types/luxon` and `@types/validator`** when those runtime deps are removed. |

---

## Summary: Removal roadmap

**Remove immediately (no code changes needed):**
- `@mui/x-date-pickers` — completely unused

**Remove together (one large MUI migration):**
- `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/system`, `@mui/x-data-grid`
- `@emotion/react`, `@emotion/styled`
- `react-hook-form-mui`

**Remove with small targeted refactors:**
- `luxon` → 2-line `Intl.DateTimeFormat` replacement in `transactions.ts`
- `usehooks-ts` → inline `useSessionStorage` hook (~10 lines)
- `validator` → inline Zod refinement in the two form schemas

**Keep, re-evaluate after MUI is out:**
- `react-hook-form` + `@hookform/resolvers` — may be worth keeping or replacing with native forms
- `recharts` — keep unless a lighter chart solution is preferred
- `@tanstack/react-query-devtools` — consider gating behind dev mode

**Keep indefinitely:**
- `react`, `react-dom`, `react-router`, `@tanstack/react-query`, `zod`, `fast-xml-parser`

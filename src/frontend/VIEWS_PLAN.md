# Frontend Views Plan

Describes the views for the new plain-HTML frontend (post-MUI rewrite per PLAN.md Stage 2).
For each view: what elements the new UI must render, and what changes the load-gen requires in lockstep.

The load-gen must not be broken mid-rewrite — frontend and load-gen changes ship together per view.

Legend:
- 🟢 Element ID unchanged from current frontend — load-gen selector stays as-is
- 🔵 Element is new or the selector changes — load-gen `selectors.ts` update required
- ⚫ Not load-gen-critical — no selector impact

---

## Views

1. [Login Page](#view-1--login-page) — `/`
2. [Navigation Shell](#view-2--navigation-shell-sidebar--header) — persistent shell on all authenticated pages
3. [Home / Dashboard](#view-3--home--dashboard-page) — `/home`
4. [Instruments List](#view-4--instruments-list-page) — `/instruments`
5. [Instrument Detail](#view-5--instrument-detail-page) — `/instruments/:id`
6. [Deposit](#view-6--deposit-page) — `/deposit`
7. [Withdraw](#view-7--withdraw-page) — `/withdraw`
8. [Credit Card](#view-8--credit-card-page) — `/credit-card`
9. [Feature Flags](#view-9--feature-flags-page) — `/feature-flags`

---

## Visit flows

- [NEW_FLOW.md](NEW_FLOW.md) — step-by-step load-gen actions against the new frontend (updated selectors, static sidebar, native `<select>`)
- [OLD_FLOW.md](OLD_FLOW.md) — step-by-step load-gen actions against the current MUI frontend (reference / regression baseline)

---

## View 1 — Login Page

**Route:** `/` or `/login`

Two-column layout. Load-Gen only uses the left column (username/password form).

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Username field | `<input>` | `login` | 🟢 unchanged |
| Password field | `<input>` | `password` | 🟢 unchanged |
| Login button | `<button>` | `submitButton` | 🟢 unchanged |
| Preset-user picker (right col) | `<select>` + `<button>` | — | ⚫ not used by load-gen |

**Load-Gen changes:** none.

---

## View 2 — Navigation Shell (sidebar + header)

Present on every authenticated page.
New design: **static sidebar** — always visible, no drawer, no hamburger toggle.

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| ~~Sidebar toggle~~ | removed | ~~`navigationToggler`~~ | 🔵 selector removed |
| Home link | `<a>` | `nav-home` | 🔵 selector updated |
| Instruments link | `<a>` | `nav-instruments` | 🔵 selector updated |
| Deposit link | `<a>` | `nav-deposit` | 🔵 selector updated |
| Withdraw link | `<a>` | `nav-withdraw` | 🔵 selector updated |
| Credit Card link | `<a>` | `nav-credit-card` | 🔵 selector updated |
| Profile dropdown toggle | `<button>` | `profileToggler` | 🟢 unchanged |
| Logout item | `<li>` | `logoutItem` | 🟢 unchanged |

**Load-Gen changes required:**

- `selectors.ts` — remove `navigation_sidebarToggler`; update all 5 nav link selectors from `//a[contains(@href, "…")]` to `//a[@id="nav-…"]`
- `helpers/common.ts` — `showNavbar()` and `hideNavbar()` become no-ops (sidebar is always visible); `gotoPageWithNavBar()` can skip the show/hide step and call `pageActions.navigate(selector)` directly

---

## View 3 — Home / Dashboard Page

**Route:** `/home`

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Current balance | `<input readonly>` | `currentBalance` | 🟢 unchanged |
| Owned instruments | plain `<table>` | — | ⚫ not used by load-gen |
| Transactions | plain `<table>` | — | ⚫ not used by load-gen |
| Portfolio chart | canvas / svg | — | ⚫ not used by load-gen |

**Load-Gen changes:** none.

---

## View 4 — Instruments List Page

**Route:** `/instruments`

The load-gen calls `getAllHandles` on these selectors to pick a random card — so IDs are not suitable (multiple elements). Keeping class names requires no load-gen change; migrating to `data-testid` requires a selector update.

| Element | New tag | Attribute | Load-Gen impact |
|---------|---------|-----------|----------------|
| Any instrument card (link) | `<div> > <a>` | `class="instrument-card"` (keep) **or** `data-testid="instrument-card"` (migrate) | 🟢 if class kept / 🔵 if migrated to data-testid |
| Owned instrument card (link) | `<div> > <a>` | `class="owned-instrument"` (keep) **or** `data-testid="owned-instrument"` (migrate) | 🟢 if class kept / 🔵 if migrated to data-testid |

**Load-Gen changes:** none if CSS classes are preserved on the new card `<div>`. If migrating to `data-testid`, update the two `instrumentsPage_*` selectors in `selectors.ts` to `//div[@data-testid="instrument-card"]/a` etc.

---

## View 5 — Instrument Detail Page

**Route:** `/instruments/:id`

### Header

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Instrument name | any inline element | `instrumentName` | 🟢 unchanged |
| Instrument price | `<h5>` | `instrumentPrice` | 🟢 unchanged — selector is `//h5[@id="instrumentPrice"]`, tag must stay `<h5>` |
| Current balance | `<input readonly>` | `currentBalance` | 🟢 unchanged |

### Trade tab buttons

Tabs are plain `<button>` elements. New frontend adds IDs; load-gen selectors change from text-match to ID-match.

| Tab | New tag | `id` | Old selector | New selector |
|-----|---------|------|--------------|--------------|
| Quick Buy | `<button>` | `quickBuyTab` | `//button[text()="Quick Buy"]` | `//button[@id="quickBuyTab"]` |
| Quick Sell | `<button>` | `quickSellTab` | `//button[text()="Quick Sell"]` | `//button[@id="quickSellTab"]` |
| Buy | `<button>` | `buyTab` | `//button[text()="Buy"]` | `//button[@id="buyTab"]` |
| Sell | `<button>` | `sellTab` | `//button[text()="Sell"]` | `//button[@id="sellTab"]` |

### Quick Buy form

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Amount | `<input>` | `amount` | 🟢 unchanged |
| Price (read-only) | `<input readonly>` | `price` | 🟢 unchanged |
| Current balance (read-only) | `<input readonly>` | `currentBalance` | 🟢 unchanged |
| Submit | `<button>` | `submitButton` | 🟢 unchanged |

### Quick Sell form

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Amount | `<input>` | `amount` | 🟢 unchanged |
| Possessed amount (read-only) | `<input readonly>` | `posessedAmount` | 🟢 unchanged — typo intentional, load-gen targets this exact string |
| Submit | `<button>` | `submitButton` | 🟢 unchanged |

### Buy form / Sell form (scheduled)

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Amount | `<input>` | `amount` | 🟢 unchanged |
| Price | `<input>` | `price` | 🟢 unchanged |
| Duration | `<input>` | `time` | 🟢 unchanged |
| Submit | `<button>` | `submitButton` | 🟢 unchanged |

**Load-Gen changes required:**

- `selectors.ts` — update `instrumentPage_quickBuyForm`, `instrumentPage_quickSellForm`, `instrumentPage_buyForm`, `instrumentPage_sellForm` from text-match XPath to `//button[@id="…"]`

---

## View 6 — Deposit Page

**Route:** `/deposit`

MUI Select (`<div id="cardType">` + portal `<li>`) is replaced by a native `<select id="cardType">`.

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Amount | `<input>` | `amount` | 🟢 unchanged |
| Cardholder name | `<input>` | `cardholderName` | 🟢 unchanged |
| Address | `<input>` | `address` | 🟢 unchanged |
| Email | `<input>` | `email` | 🟢 unchanged |
| Card number | `<input>` | `cardNumber` | 🟢 unchanged |
| CVV | `<input>` | `cvv` | 🟢 unchanged |
| Card type | `<select>` | `cardType` | 🔵 tag changes from `<div>` to `<select>`, option selection changes |
| Accept terms | `<input type="checkbox">` | `agreement` | 🟢 unchanged |
| Submit | `<button>` | `submitButton` | 🔵 currently `//form//button[@type="submit"]`, gains explicit ID |

**Load-Gen changes required:**

- `selectors.ts`:
  - `depositPage_cardType`: `//div[@id="cardType"]` → `//select[@id="cardType"]`
  - `depositPage_cardType_provider`: `//*[@id="menu-cardType"]//li[contains(text(), "…")]` → `//select[@id="cardType"]/option[contains(text(), "…")]`
  - `depositPage_submit`: `//form//button[@type="submit"]` → `//button[@id="submitButton"]`
- `helpers/common.ts` — `selectCardProvider()`: replace the MUI click-portal-click sequence with a native select interaction (e.g. `pageActions.select('#cardType', value)` or equivalent `page.select()` call)

---

## View 7 — Withdraw Page

**Route:** `/withdraw`

Same form structure as Deposit; no CVV field. Shares the same `selectors.ts` entries (`depositPage_*`).

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Amount | `<input>` | `amount` | 🟢 unchanged |
| Cardholder name | `<input>` | `cardholderName` | 🟢 unchanged |
| Address | `<input>` | `address` | 🟢 unchanged |
| Email | `<input>` | `email` | 🟢 unchanged |
| Card number | `<input>` | `cardNumber` | 🟢 unchanged |
| Card type | `<select>` | `cardType` | 🔵 same change as Deposit |
| Accept terms | `<input type="checkbox">` | `agreement` | 🟢 unchanged |
| Submit | `<button>` | `submitButton` | 🔵 same change as Deposit |

**Load-Gen changes required:** same as Deposit (shared selectors — fix once, applies to both).

---

## View 8 — Credit Card Page

**Route:** `/credit-card`

MUI Select (`<div id="type">` + portal `<li>`) is replaced by a native `<select id="type">`.

### Order form

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Name | `<input>` | `name` | 🟢 unchanged |
| Address | `<input>` | `address` | 🟢 unchanged |
| Email | `<input>` | `email` | 🟢 unchanged |
| Card type | `<select>` | `type` | 🔵 tag changes from `<div>`, option selection changes |
| Accept terms | `<input type="checkbox">` | `agreement` | 🟢 unchanged |
| Order button | `<button>` | `submitButton` | 🟢 unchanged |

### Active card state

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Revoke card button | `<button>` | `revoke-card` | 🟢 unchanged |

### Pending order state

| Element | New tag | `id` | Load-Gen impact |
|---------|---------|------|----------------|
| Order ID | `<p>` | `order-id` | 🟢 unchanged — selector is `//p[@id="order-id"]`, tag must stay `<p>` |

**Load-Gen changes required:**

- `selectors.ts`:
  - `creditCardPage_cardTypeInput`: `//div[@id="type"]` → `//select[@id="type"]`
  - `creditCardPage_cardType_type`: `//*[@id="menu-type"]//li[contains(text(), "…")]` → `//select[@id="type"]/option[contains(text(), "…")]`
- `helpers/creditCard.ts` — `orderCard()`: replace `click(cardTypeInput)` + `getHandle(cardType_type)` + `clickHandle()` with a native select call

---

## View 9 — Feature Flags Page

**Route:** `/feature-flags`

Not load-gen-critical.

| Element | New tag | Notes |
|---------|---------|-------|
| Flag list | `<ul>` | One `<li>` per flag |
| Enable / disable button | `<button>` | Inline, no accordion |
| Status text | inline text | No Snackbar |

**Load-Gen changes:** none.

---

## Consolidated load-gen changes

All changes are in `src/load-gen/src/`.

### `selectors.ts`

| Key | Old XPath | New XPath |
|-----|-----------|-----------|
| `navigation_sidebarToggler` | `//button[@id="navigationToggler"]` | **remove** |
| `navigation_homePage` | `//a[contains(@href, "home")]` | `//a[@id="nav-home"]` |
| `navigation_depositPage` | `//a[contains(@href, "deposit")]` | `//a[@id="nav-deposit"]` |
| `navigation_withdrawPage` | `//a[contains(@href, "withdraw")]` | `//a[@id="nav-withdraw"]` |
| `navigation_instrumentsPage` | `//a[contains(@href, "instruments")]` | `//a[@id="nav-instruments"]` |
| `navigation_creditCardPage` | `//a[contains(@href, "credit-card")]` | `//a[@id="nav-credit-card"]` |
| `instrumentPage_quickBuyForm` | `//button[text()="Quick Buy"]` | `//button[@id="quickBuyTab"]` |
| `instrumentPage_quickSellForm` | `//button[text()="Quick Sell"]` | `//button[@id="quickSellTab"]` |
| `instrumentPage_buyForm` | `//button[text()="Buy"]` | `//button[@id="buyTab"]` |
| `instrumentPage_sellForm` | `//button[text()="Sell"]` | `//button[@id="sellTab"]` |
| `depositPage_cardType` | `//div[@id="cardType"]` | `//select[@id="cardType"]` |
| `depositPage_cardType_provider` | `//*[@id="menu-cardType"]//li[contains(text(), "${p}")]` | `//select[@id="cardType"]/option[contains(text(), "${p}")]` |
| `depositPage_submit` | `//form//button[@type="submit"]` | `//button[@id="submitButton"]` |
| `creditCardPage_cardTypeInput` | `//div[@id="type"]` | `//select[@id="type"]` |
| `creditCardPage_cardType_type` | `//*[@id="menu-type"]//li[contains(text(), "${t}")]` | `//select[@id="type"]/option[contains(text(), "${t}")]` |

### `helpers/common.ts`

- `showNavbar()` → no-op (remove the toggle logic; sidebar is always visible)
- `hideNavbar()` → no-op or remove
- `gotoPageWithNavBar()` → remove `showNavbar()` call, just navigate directly
- `selectCardProvider()` → replace MUI portal click sequence with native `<select>` value assignment

### `helpers/creditCard.ts`

- `orderCard()` → replace the `click(cardTypeInput)` + `getHandle(cardType_type)` + `clickHandle()` block with a native select call matching the new `<select id="type">` element

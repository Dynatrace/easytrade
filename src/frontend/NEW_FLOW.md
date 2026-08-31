## What changed from OLD_FLOW.md

### Navigation — no sidebar toggling
The old flow called `showNavbar()` before every navigation, which conditionally opened the MUI Drawer via `#navigationToggler`. The new frontend has a static always-visible sidebar, so no open/close step is needed.

| Old | New |
|-----|-----|
| `⏳ open sidebar · nav a[href≈deposit] ⏳` | `nav #nav-deposit ⏳` |
| `wait a[href≈home]` (after login) | `wait #nav-home` |

### Navigation links — href → id
Nav links previously had no `id` and were found by matching `href`. They now have explicit IDs.

| Selector key | Old XPath | New XPath |
|---|---|---|
| `navigation_homePage` | `//a[contains(@href, "home")]` | `//a[@id="nav-home"]` |
| `navigation_depositPage` | `//a[contains(@href, "deposit")]` | `//a[@id="nav-deposit"]` |
| `navigation_withdrawPage` | `//a[contains(@href, "withdraw")]` | `//a[@id="nav-withdraw"]` |
| `navigation_instrumentsPage` | `//a[contains(@href, "instruments")]` | `//a[@id="nav-instruments"]` |
| `navigation_creditCardPage` | `//a[contains(@href, "credit-card")]` | `//a[@id="nav-credit-card"]` |
| `navigation_sidebarToggler` | `//button[@id="navigationToggler"]` | **removed** |

### Trade tab buttons — text → id
Tab buttons were found by their visible text label, which breaks silently on any copy change. They now have explicit IDs.

| Selector key | Old XPath | New XPath |
|---|---|---|
| `instrumentPage_quickBuyForm` | `//button[text()="Quick Buy"]` | `//button[@id="quickBuyTab"]` |
| `instrumentPage_quickSellForm` | `//button[text()="Quick Sell"]` | `//button[@id="quickSellTab"]` |
| `instrumentPage_buyForm` | `//button[text()="Buy"]` | `//button[@id="buyTab"]` |
| `instrumentPage_sellForm` | `//button[text()="Sell"]` | `//button[@id="sellTab"]` |

### Card type dropdowns — MUI Select portal → native `<select>`
The old flow used a two-step MUI portal pattern: click the `<div>` trigger to mount a detached portal `<ul>`, then find and click a `<li>` by text. The new frontend uses a plain `<select>`, so it is a single interaction.

| Selector key | Old | New |
|---|---|---|
| `depositPage_cardType` | `click //div[@id="cardType"]` | `sel //select[@id="cardType"]` |
| `depositPage_cardType_provider` | `//*[@id="menu-cardType"]//li[contains(text(), …)]` | `//select[@id="cardType"]/option[contains(text(), …)]` |
| `depositPage_submit` | `//form//button[@type="submit"]` | `//button[@id="submitButton"]` |
| `creditCardPage_cardTypeInput` | `click //div[@id="type"]` | `sel //select[@id="type"]` |
| `creditCardPage_cardType_type` | `//*[@id="menu-type"]//li[contains(text(), …)]` | `//select[@id="type"]/option[contains(text(), …)]` |

### Helper functions to update (`src/load-gen/src/helpers/`)

| File | Function | Change |
|------|----------|--------|
| `common.ts` | `showNavbar()` | no-op — sidebar always visible |
| `common.ts` | `hideNavbar()` | no-op or remove |
| `common.ts` | `gotoPageWithNavBar()` | remove `showNavbar()` call |
| `common.ts` | `selectCardProvider()` | replace MUI click-portal-click with native select |
| `creditCard.ts` | `orderCard()` | replace `click #type · getHandle · clickHandle` with native select |

---

## Visit flows (reference)

Delay legend: ⚡ ~500ms · ⏳ ~1500ms · 🕐 ~2000ms (endDtSession)
Action legend: `type` fill input · `nav` follow link · `click` click · `read` read value · `sel` native select · `wait` await element

| Visit | Page sequence | Steps |
|-------|---------------|-------|
| `deposit_and_buy` | 1 Login → 6 Deposit → 4 Instruments List → 5 Instrument Detail (Quick Buy) → 8 Credit Card → Logout | 1. → url<br>2. type `#login` ⚡<br>3. type `#password` ⚡<br>4. nav `#submitButton` · wait `#nav-home`<br>5. nav `#nav-deposit` ⏳<br>6. type `#amount` ⏳<br>7. type `#cardholderName` ⏳<br>8. type `#address` ⏳<br>9. type `#email` ⏳<br>10. type `#cardNumber` ⏳<br>11. sel `#cardType` = provider ⚡<br>12. type `#cvv` ⏳<br>13. click `#agreement` ⚡<br>14. click `#submitButton`<br>15. nav `#nav-instruments` ⏳<br>16. wait `.instrument-card` · nav random card<br>17. click `#quickBuyTab` · wait `#amount`<br>18. read `#price` · read `#currentBalance` · read `#instrumentName`<br>19. type `#amount` = buyAmount ⏳<br>20. click `#submitButton`<br>21. nav `#nav-credit-card` ⏳<br>22. click `#profileToggler` · wait `#logoutItem` · nav `#logoutItem`<br>23. 🕐 endDtSession |
| `deposit_and_long_buy` | 1 Login → 6 Deposit → 4 Instruments List → 5 Instrument Detail (Quick Buy → Buy) → 8 Credit Card → Logout | 1. → url<br>2. type `#login` ⚡<br>3. type `#password` ⚡<br>4. nav `#submitButton` · wait `#nav-home`<br>5. nav `#nav-deposit` ⏳<br>6. type `#amount` ⏳<br>7. type `#cardholderName` ⏳<br>8. type `#address` ⏳<br>9. type `#email` ⏳<br>10. type `#cardNumber` ⏳<br>11. sel `#cardType` = provider ⚡<br>12. type `#cvv` ⏳<br>13. click `#agreement` ⚡<br>14. click `#submitButton`<br>15. nav `#nav-instruments` ⏳<br>16. wait `.instrument-card` · nav random card<br>17. read `#currentBalance` (Quick Buy is default tab)<br>18. click `#buyTab` · wait `#time`<br>19. read `#price` · read `#instrumentName`<br>20. type `#amount` ⏳<br>21. type `#price` ⏳<br>22. type `#time` ⏳<br>23. click `#submitButton`<br>24. nav `#nav-credit-card` ⏳<br>25. click `#profileToggler` · wait `#logoutItem` · nav `#logoutItem`<br>26. 🕐 endDtSession |
| `long_sell` | 1 Login → 4 Instruments List → 5 Instrument Detail (Quick Sell → Sell) → 8 Credit Card → Logout | 1. → url<br>2. type `#login` ⚡<br>3. type `#password` ⚡<br>4. nav `#submitButton` · wait `#nav-home`<br>5. nav `#nav-instruments` ⏳<br>6. wait `.owned-instrument` · nav random owned card<br>7. click `#quickSellTab` · wait `#posessedAmount`<br>8. read `#posessedAmount`<br>9. click `#sellTab` · wait `#time`<br>10. read `#price` · read `#instrumentName`<br>11. type `#amount` ⏳<br>12. type `#price` ⏳<br>13. type `#time` ⏳<br>14. click `#submitButton`<br>15. nav `#nav-credit-card` ⏳<br>16. click `#profileToggler` · wait `#logoutItem` · nav `#logoutItem`<br>17. 🕐 endDtSession |
| `sell_and_withdraw` | 1 Login → 4 Instruments List → 5 Instrument Detail (Quick Sell) → 7 Withdraw → 8 Credit Card → Logout | 1. → url<br>2. type `#login` ⚡<br>3. type `#password` ⚡<br>4. nav `#submitButton` · wait `#nav-home`<br>5. nav `#nav-instruments` ⏳<br>6. wait `.owned-instrument` · nav random owned card<br>7. click `#quickSellTab` · wait `#posessedAmount`<br>8. read `#posessedAmount` · read `#price` · read `#instrumentName`<br>9. type `#amount` = sellAmount ⏳<br>10. click `#submitButton`<br>11. nav `#nav-withdraw` ⏳<br>12. type `#amount` ⏳<br>13. type `#cardholderName` ⏳<br>14. type `#address` ⏳<br>15. type `#email` ⏳<br>16. type `#cardNumber` ⏳<br>17. sel `#cardType` = provider ⏳<br>18. click `#agreement` ⚡<br>19. click `#submitButton`<br>20. nav `#nav-credit-card` ⏳<br>21. click `#profileToggler` · wait `#logoutItem` · nav `#logoutItem`<br>22. 🕐 endDtSession |
| `order_credit_card` | 1 Login → 8 Credit Card → Logout | 1. → url<br>2. type `#login` ⚡<br>3. type `#password` ⚡<br>4. nav `#submitButton` · wait `#nav-home`<br>5. nav `#nav-credit-card` ⏳<br>6. check `#order-id` present? → if yes, stop early<br>7. check `#revoke-card` present? → if yes, nav `#revoke-card`<br>8. type `#name` ⏳<br>9. type `#address` ⏳<br>10. type `#email` ⏳<br>11. sel `#type` = cardType ⏳<br>12. click `#agreement` ⏳<br>13. click `#submitButton`<br>14. click `#profileToggler` · wait `#logoutItem` · nav `#logoutItem`<br>15. 🕐 endDtSession |

---
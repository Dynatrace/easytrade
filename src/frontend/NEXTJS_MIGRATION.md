# EasyTrade Frontend — Next.js Migration Notes

> Part of the refactoring research. Start with [PLAN.md](PLAN.md) for the full picture.

## Should we migrate to Next.js?

### The argument for migration

> "Next.js seems like a promising upgrade since it may shift a lot of compute away from the headless browser running on the load generator."

This is worth examining carefully, because it is **not correct**.

### How the load generator actually works

The load generator (`src/loadgen`) uses **Puppeteer** — a full Chromium browser controlled programmatically. It:

1. Navigates to the nginx URL just like a real user would.
2. Waits for specific XPath selectors to appear in the DOM (e.g., `//button[@id="submitButton"]`, `//input[@id="currentBalance"]`).
3. Clicks buttons and fills inputs via DOM interaction.
4. Reads values from rendered elements to extract prices and balances.

### Why SSR does not reduce headless browser compute

With **server-side rendering**, the server sends pre-rendered HTML. The browser still must:

1. Download and parse the full React JS bundle.
2. **Hydrate** — attach React's virtual DOM and event handlers to the server-rendered HTML.

Steps 1 and 2 are mandatory because the loadgen's selectors target *interactive* elements (buttons with click handlers, inputs with controlled values). Server-rendered static HTML is not enough — the elements must be hydrated before Puppeteer can interact with them.

The CPU cost in the headless browser is V8 executing React's reconciler during hydration. That cost is the same with or without SSR. SSR reduces *time-to-first-paint*, which Puppeteer does not measure or care about — it waits for selector presence, not paint events.

**SSR does not meaningfully reduce headless browser compute.**

### The real architectural blockers

Even setting aside the loadgen argument, Next.js migration carries high cost:

| Blocker | Detail |
|---|---|
| Session-storage auth | `AuthContext` and route loaders read `sessionStorage["user-id"]`. `window` and `sessionStorage` are unavailable on the server. Auth would need a full redesign (cookies or JWTs). |
| `EnvProxy` | Builds all backend URLs from `window.location.origin` at runtime. Breaks on the server. Every `Backend` class instantiation would fail during SSR. |
| nginx double-proxy | The existing compose/Helm setup proxies everything through nginx. Next.js ships its own Node.js server, creating a redundant proxy layer without clear benefit. |
| No SEO surface | Every meaningful route requires login. SSR's primary benefit — indexable HTML — is irrelevant for an authenticated demo app. |

### Better alternatives

| Option | Effort | What you get |
|---|---|---|
| Stay with Vite SPA (current) | none | Zero disruption, fast builds, proven |
| React Router v7 framework mode | medium | SSR/loaders native to the existing routing paradigm, no new framework |
| Migrate loadgen off Puppeteer | medium | Actual compute reduction by replacing full-browser with lightweight HTTP clients |

Given that RUM data is required and a real browser must be retained, would it be worth migrating the load generator from Puppeteer to Playwright for improved reliability, auto-waiting, and potentially lower resource consumption? It may not help, but it's worth a try.


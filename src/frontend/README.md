# EasyTrade Frontend

The EasyTrade web UI: a React single-page app built with Vite and served by nginx in the
container image. It talks to the backend through the reverse proxy, so every request goes to
the same origin the page was loaded from.

## Technologies

- React 18 + TypeScript (strict)
- Vite
- React Router 7 (data router: route loaders + `lazy` components)
- TanStack Query v5 (server-state cache)
- Plain CSS
- lightweight-charts (price charts)
- Docker (nginx runtime image)
- Vitest + Testing Library

## Local development

```bash
npm install
npm run dev        # dev server on :3000
npm run build      # production build to dist/
npm run build-test # tsc && vitest --run
npm run lint       # eslint
npm test        # Vitest
npm run format     # prettier
```

The dev server only serves the frontend. For anything that talks to a backend run the full stack from the repo root:

```bash
make start
```

Run `make help` for every target.
The app is then at `http://localhost`

```bash
make build services=frontend      # build the image from local source
make redeploy services=frontend   # rebuild and recreate it in the running stack
```

## Features

- dark UI theme
- Buy and sell instruments at the current price, or place a long buy/sell
  disposition at a chosen price and duration
- Portfolio value chart and transaction history
- Credit card ordering, status tracking and revocation
- Problem-pattern feature flags (`/feature-flags`) and service versions
  (`/version`)

---

## ⚠ The loadgen contract

`src/loadgen/src/selectors.ts` drives the synthetic traffic generator with
**XPath selectors bound to specific DOM ids and element tags**, for example:

```
//h5[@id="instrumentPrice"]      //p[@id="order-id"]
//button[@id="submitButton"]     //input[@id="amount"]
```

It also matches the `instrument-card` and `owned-instrument` **class names**.

Changing or removing one of those ids, changing the element's tag, or renaming
those classes **breaks load generation**, and nothing in this project's tests
will catch it. Check `selectors.ts` before touching markup, and keep ids unique.

## data-dt-\* attributes

NOTE: data-dt-\* attributes (e.g. data-dt-name, data-dt-children-name, data-dt-features)
are Dynatrace RUM instrumentation tags used for tracking user interactions in analytics.
They are likely not strictly required for the application to function.

# easyTradeFrontend

The EasyTrade web UI: a React single-page app built with Vite and served by nginx in the
container image. It talks to the backend through the reverse proxy, so every request goes to
the same origin the page was loaded from.

## Technologies used

- React 18 + TypeScript
- Vite
- TanStack Query (server state), React Router (routing)
- lightweight-charts (price charts)
- Docker (nginx runtime image)

## Local development

```bash
npm install
npm run dev     # Vite dev server on port 3000
npm run build   # type-check and bundle to dist/
npm test        # Vitest
npm run lint    # ESLint
```

The dev server only serves the UI - API calls still need the backend, so run the full stack
with `make start` (which publishes the containerised frontend on host port 8092) or point
`VITE_BASE_URL` at a running reverse proxy.

## Local build instructions

```bash
make build services=frontend      # build the image from local source
make redeploy services=frontend   # rebuild and recreate it in the running stack
```

Run `make help` for every target.

The image serves the built assets with nginx on port `3000`.

## Features

- dark UI theme
- problem pattern management - if enabled, then you can enable/disable feature flags that control problem patterns
- buy/sell stocks at the current price
- long buy/sell disposition - set the price and time for the trade and check later if it succeeded
- order/delete a credit card for your account

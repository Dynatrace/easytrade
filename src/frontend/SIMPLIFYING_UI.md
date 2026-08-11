# Headless Browser Resource Cost

Measured on a single machine with 1 Chrome instance (`BROWSERS=1`) and 5 concurrent visits (`CONCURRENCY=5`).

## Results

| Scenario | loadgen container RAM |
|---|---|
| Idle — load login page, stay, repeat | **1.09 GiB** |
| Full visits — login, deposit, buy, sell, navigate | **~1.2–1.3 GiB** |

The delta between doing nothing and running full visits is ~200 MiB.

## What this means

The ~1.09 GiB idle baseline is the floor cost of running headless Chromium with 5 browser contexts. It exists regardless of what the page looks like, because it comes from:

- Chrome's renderer processes (one per browser context)
- V8 heap for the JavaScript engine
- React bundle parse, compile, and hydration on each page load

The additional ~200 MiB in full visits covers all navigation, TanStack Query fetches, React re-renders across multiple pages, and XML login/logout round-trips combined.

## Conclusion

Simplifying the frontend UI — removing animations, replacing dropdowns with plain inputs, eliminating sliding menus — cannot reduce this cost. Those changes affect CSS paint and layout work, not V8 heap or Chrome process overhead.

The only levers that actually reduce loadgen resource usage are:

1. **Fewer concurrent visits** — direct config change (`CONCURRENCY` env var)
2. **Fewer concurrent browsers** — direct config change (`BROWSERS` env var)
3. **Fewer navigations per visit** — redesign visit scripts to do less per run

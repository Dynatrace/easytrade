---
description: TypeScript/Node.js patterns, anti-patterns, and conventions for EasyTrade services (frontend, loadgen, offerservice)
globs: src/frontend/**/*.ts,src/frontend/**/*.tsx,src/loadgen/**/*.ts,src/offerservice/**/*.ts
---

# TypeScript Conventions

## Anti-Patterns

- NEVER use `any` type without an explicit suppression comment explaining why
- NEVER use `var` — use `const` for values that don't change, `let` otherwise
- Do NOT use default exports — use named exports for consistency

## Patterns

- Handle fetch errors explicitly — check `response.ok` before parsing JSON
- Use `overrides` in `package.json` to pin transitive deps, not `resolutions`
- Run `npm install` after adding or changing `overrides`

## Imports

- Import from the most specific subpath available, not the package root

## Error Handling

- Propagate errors to the caller rather than swallowing them silently
- Log the full error object, not just `error.message`

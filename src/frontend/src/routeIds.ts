/**
 * Route ids shared by `router.tsx` and the components that call
 * `useRouteLoaderData`.
 *
 * These live in their own leaf module rather than in `router.tsx` so that
 * consumers do not import the router back — that cycle pulls every loader and
 * api module into each lazy page chunk and defeats code splitting.
 */
export enum LoaderIds {
    user = "user-loader",
    instruments = "instruments-loader",
    transactions = "transactions-loader",
    creditCard = "creditCard-loader",
    creditCardStatusHistory = "creditCardStatusHistory-loader",
}

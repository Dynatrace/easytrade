import { createBrowserRouter, type RouteObject } from "react-router"
import ProviderLayout from "../layouts/ProviderLayout"
import BaseNavigation from "../pages/BaseNavigation"
import ErrorPage from "../pages/ErrorPage"
import { PageSpinner } from "../components/PageSpinner"
import { lazyPage } from "./helpers"
import { publicRoutes } from "./public.routes"
import { protectedRoutes } from "./protected.routes"

const routes: RouteObject[] = [
    {
        path: "/",
        element: <ProviderLayout />,
        errorElement: <ErrorPage />,
        HydrateFallback: PageSpinner,
        children: [
            {
                index: true,
                element: <BaseNavigation />,
            },
            {
                path: "feature-flags",
                lazy: lazyPage(() => import("../pages/FeatureFlags")),
            },
            {
                path: "version",
                lazy: lazyPage(() => import("../pages/Version")),
            },
            publicRoutes,
            protectedRoutes,
            {
                path: "*",
                element: <BaseNavigation />,
            },
        ],
    },
]

export const router = createBrowserRouter(routes, {
    basename: import.meta.env.VITE_BASE_URL,
})

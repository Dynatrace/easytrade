import type { RouteObject } from "react-router"
import PublicLayout from "../layouts/PublicLayout"
import { lazyPage } from "./helpers"
import { presetUsersLoader } from "../hooks/useUser"

export const publicRoutes: RouteObject = {
    element: <PublicLayout />,
    children: [
        {
            path: "login",
            loader: presetUsersLoader,
            lazy: lazyPage(() => import("../pages/public/Login")),
        },
        {
            path: "signup",
            lazy: lazyPage(() => import("../pages/public/Signup")),
        },
    ],
}

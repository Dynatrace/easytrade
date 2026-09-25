import type { RouteObject } from "react-router"
import PublicLayout from "../layouts/PublicLayout"
import { queryClient } from "../contexts/QueryContext/QueryContext"
import { presetUsersLoader } from "../contexts/QueryContext/user/loaders"
import { getPresetUsers } from "../api/user/user"
import { lazyPage } from "./helpers"

export const publicRoutes: RouteObject = {
    element: <PublicLayout />,
    children: [
        {
            path: "login",
            loader: presetUsersLoader(queryClient, getPresetUsers),
            lazy: lazyPage(() => import("../pages/public/Login")),
        },
        {
            path: "signup",
            lazy: lazyPage(() => import("../pages/public/Signup")),
        },
    ],
}

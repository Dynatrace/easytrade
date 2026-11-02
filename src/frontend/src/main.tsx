import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router"
import { router } from "./router"
import "./styles/global.css"
import "./styles/layout.css"
import "./styles/components.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)

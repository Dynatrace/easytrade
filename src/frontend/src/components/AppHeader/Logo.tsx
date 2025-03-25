import React from "react"
import { Link } from "@mui/material"
import { Link as RouterLink } from "react-router"

export default function Logo() {
    return (
        <Link
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
            }}
        >
            EasyTrade
        </Link>
    )
}

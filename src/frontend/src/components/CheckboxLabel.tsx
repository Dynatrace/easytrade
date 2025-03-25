import React from "react"
import { Typography, TypographyVariant } from "@mui/material"

type variantOptions = TypographyVariant | "inherit"

export default function CheckboxLabel({
    text,
    variant = "body1",
    hasErrors,
}: {
    text: string
    variant?: variantOptions
    hasErrors?: boolean
}) {
    return (
        <Typography variant={variant} color={hasErrors ? "error" : ""}>
            {text}
        </Typography>
    )
}

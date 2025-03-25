import React from "react"
import { Stack, Typography } from "@mui/material"
import { Price } from "../../api/price/types"
import { useFormatter } from "../../contexts/FormatterContext/context"
import { useTheme } from "../../contexts/ThemeContext/ThemeContext"
import { InstrumentPrice } from "../../api/instrument/types"

export default function PriceDisplay({
    price,
}: {
    price: Price | InstrumentPrice
}) {
    const { formatCurrency, formatPercent } = useFormatter()
    const {
        theme: {
            palette: { success, error },
        },
    } = useTheme()
    const trendingUp = price.close > price.open
    const color = trendingUp ? success : error
    const percentDifference = (price.close - price.open) / price.open
    return (
        <Stack
            direction={"row"}
            alignItems={"flex-start"}
            justifyContent={"flex-start"}
            spacing={1}
            data-dt-name={"Instrument price"}
            data-dt-children-name={"Instrument variation"}
        >
            <Typography
                id="instrumentPrice"
                color={color.main}
                variant="h5"
                sx={{ fontWeight: 600 }}
            >
                {formatCurrency(price.close)}
            </Typography>
            <Typography
                color={color.main}
                variant="caption"
                sx={{ fontWeight: 600 }}
            >
                {formatPercent(percentDifference)}
            </Typography>
        </Stack>
    )
}

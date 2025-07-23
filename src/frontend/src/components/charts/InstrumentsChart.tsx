import React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts"
import { Box, Typography } from "@mui/material"
import { useTheme } from "../../contexts/ThemeContext/ThemeContext"
import { useFormatter } from "../../contexts/FormatterContext/context"
import { Instrument } from "../../api/instrument/types"

type InstrumentsChartProps = {
    instruments: Instrument[]
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
    const { formatCurrency } = useFormatter()

    if (active && payload && payload.length) {
        /* eslint-disable */
        const name = payload[0].payload.name
        const amount = payload[0].payload.amount
        const totalValue = formatCurrency(payload[0].payload.totalValue)
        /* eslint-enable */
        return (
            <Box>
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body1">Amount: {amount}</Typography>
                <Typography variant="body1">
                    Total value: {totalValue}
                </Typography>
            </Box>
        )
    }

    return null
}

export default function InstrumentsChart({
    instruments,
}: InstrumentsChartProps) {
    const { theme } = useTheme()

    const instrumentsData = instruments.map((instrument) => {
        return {
            name: instrument.name,
            code: instrument.code,
            amount: instrument.amount,
            totalValue: instrument.amount * instrument.price.close,
        }
    })

    return (
        <Box
            height="300px"
            width="100%"
            display={"flex"}
            justifyContent={"center"}
            data-dt-features={"main-chart"}
            data-dt-mouse-over="300"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instrumentsData}>
                    <XAxis
                        dataKey="code"
                        interval={0}
                        tick={{ fontSize: 14 }}
                    />
                    <YAxis yAxisId="left" dataKey="amount" width={80}>
                        <Label
                            value="Amount"
                            angle={-90}
                            position="insideLeft"
                            style={{ textAnchor: "middle" }}
                        />
                    </YAxis>
                    <YAxis
                        yAxisId="right"
                        dataKey="totalValue"
                        orientation="right"
                        width={80}
                        unit="$"
                    >
                        <Label
                            value="Total value"
                            angle={90}
                            position="insideRight"
                            style={{ textAnchor: "middle" }}
                        />
                    </YAxis>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip
                        content={CustomTooltip}
                        wrapperStyle={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            borderStyle: "ridge",
                            padding: "10px",
                        }}
                    />
                    <Legend iconType="square" />
                    <Bar
                        dataKey="amount"
                        name="Amount"
                        fill={theme.palette.primary.main}
                        yAxisId="left"
                    />
                    <Bar
                        dataKey="totalValue"
                        name="Total value"
                        fill={theme.palette.success.main}
                        yAxisId="right"
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    )
}

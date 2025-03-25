import React from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Typography } from "@mui/material"
import { TransactionData } from "./TransactionsCharts"
import { useTheme } from "../../contexts/ThemeContext/ThemeContext"

type TransactionsPieChartProps = {
    transactionData: TransactionData[]
}

type CustomLabelProps = {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
    value: number
}

const RADIAN = Math.PI / 180
function CustomLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
}: CustomLabelProps) {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
        >
            {`${Math.round(percent * 100)}%`}
        </text>
    )
}

export default function TransactionsPieChart({
    transactionData,
}: TransactionsPieChartProps) {
    const { theme } = useTheme()

    const colors = {
        FAIL: theme.palette.error.main,
        SUCCESS: theme.palette.success.main,
        ACTIVE: theme.palette.primary.main,
        BUY: theme.palette.primary.main,
        SELL: theme.palette.success.main,
    }

    return (
        <ResponsiveContainer width="50%" height="100%">
            <PieChart>
                <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="square"
                    formatter={(value) => (
                        <Typography
                            color={theme.palette.text.primary}
                            display="inline"
                        >
                            {value}
                        </Typography>
                    )}
                />
                <Pie
                    data={transactionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    fill="#8884d8"
                    labelLine={false}
                    label={CustomLabel}
                >
                    {transactionData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={colors[entry.name as keyof typeof colors]}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    )
}

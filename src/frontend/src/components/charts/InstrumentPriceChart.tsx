import React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Brush,
    Rectangle,
    TooltipProps,
} from "recharts"
import { Box, Typography } from "@mui/material"
import { Price } from "../../api/price/types"
import { useFormatter } from "../../contexts/FormatterContext/context"
import { useTheme } from "../../contexts/ThemeContext/ThemeContext"

type CandlestickChartProps = {
    prices: Price[]
}

type CustomBarProps = {
    date: string
    width: number
    height: number
    x: number
    y: number
    openClosePriceRange: number[]
    increasingColor: string
    decreasingColor: string
}

function CustomBar({
    date,
    width,
    height,
    x,
    y,
    openClosePriceRange,
    increasingColor,
    decreasingColor,
}: CustomBarProps) {
    return (
        <Rectangle
            key={`rectangle${date}`}
            width={width}
            height={height}
            x={x}
            y={y}
            fill={
                openClosePriceRange[0] > openClosePriceRange[1]
                    ? decreasingColor
                    : increasingColor
            }
        />
    )
}

function CustomTooltip({
    active,
    payload,
    label,
}: TooltipProps<number, string>) {
    if (active && payload && payload.length > 0) {
        /* eslint-disable */
        const [openPrice, closePrice] = payload[0]?.payload?.openClosePriceRange
        const [lowPrice, highPrice] = payload[0].payload.lowHighPriceRange
        /* eslint-enable */
        return (
            <Box>
                <Typography variant="h6">{label}</Typography>
                <Typography variant="body1">{`open: ${openPrice}; close: ${closePrice} `}</Typography>
                <Typography variant="body1">{`low: ${lowPrice}; high: ${highPrice}`}</Typography>
            </Box>
        )
    }

    return null
}

export default function InstrumentPriceChart({
    prices,
}: CandlestickChartProps) {
    const { formatTime } = useFormatter()
    const { theme } = useTheme()

    const priceData = prices
        .map((price) => {
            return {
                date: formatTime(new Date(price.timestamp).getTime()),
                openClosePriceRange: [price.open, price.close],
                lowHighPriceRange: [price.low, price.high],
            }
        })
        .reverse()

    const minValue = Math.min(...prices.map((price) => price.low))
    const maxValue = Math.max(...prices.map((price) => price.high))

    return (
        <Box
            height="200px"
            width="100%"
            display={"flex"}
            justifyContent={"center"}
            data-dt-mouse-over="300"
        >
            <ResponsiveContainer width="90%" height="100%">
                <BarChart data={priceData}>
                    <XAxis dataKey="date" xAxisId={0} />
                    <XAxis dataKey="date" xAxisId={1} hide />
                    <YAxis
                        type="number"
                        domain={[
                            minValue - 0.01 * minValue,
                            maxValue + 0.01 * minValue,
                        ]}
                        allowDataOverflow={false}
                        tickFormatter={(tick: number) => tick.toFixed(3)}
                    />
                    <Tooltip
                        content={CustomTooltip}
                        wrapperStyle={{
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            borderStyle: "ridge",
                            padding: "10px",
                        }}
                    />
                    <Bar
                        dataKey="lowHighPriceRange"
                        barSize={1}
                        xAxisId={0}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        shape={(props: any) => (
                            <CustomBar
                                {...props}
                                increasingColor={theme.palette.success.main}
                                decreasingColor={theme.palette.error.main}
                            />
                        )}
                    ></Bar>
                    <Bar
                        dataKey="openClosePriceRange"
                        xAxisId={1}
                        minPointSize={1}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        shape={(props: any) => (
                            <CustomBar
                                {...props}
                                increasingColor={theme.palette.success.main}
                                decreasingColor={theme.palette.error.main}
                            />
                        )}
                    ></Bar>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Brush
                        dataKey="date"
                        startIndex={priceData.length - 200}
                        endIndex={priceData.length - 1}
                        height={20}
                        stroke="#1565c0"
                        fill="none"
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    )
}

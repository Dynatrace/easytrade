import React from "react"
import { Instrument } from "../../api/instrument/types"

type InstrumentsChartProps = {
    instruments: Instrument[]
}

// TODO (Stage 12): Replace with lightweight-charts portfolio line chart
export default function InstrumentsChart({ instruments }: InstrumentsChartProps) {
    return (
        <div
            className="chart-container"
            data-dt-features="main-chart"
            data-dt-mouse-over="300"
            style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}
        >
            {instruments.length === 0 ? "No instruments" : `${instruments.length} instruments`}
        </div>
    )
}

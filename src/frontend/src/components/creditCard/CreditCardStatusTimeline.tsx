import React from "react"
import {
    OrderStatusEntry,
    SuccessOrderStatusHistoryResponse,
} from "../../api/creditCard/order"
import { useFormatter } from "../../contexts/FormatterContext/context"

function formatStatus(status: string): string {
    return status
        .split("_")
        .map(([head, ...tail]) => `${head.toLocaleUpperCase()}${tail.join("").toLocaleLowerCase()}`)
        .join(" ")
}

function TimelineEntry({ timestamp, status, details }: OrderStatusEntry) {
    const { formatDate } = useFormatter()
    return (
        <li className="timeline-item">
            <span className="timeline-time">{formatDate(Date.parse(timestamp))}</span>
            <span className="timeline-track">
                <span className="timeline-dot" />
                <span className="timeline-line" />
            </span>
            <div className="timeline-content">
                <strong>{formatStatus(status)}</strong>
                {details && (
                    <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        {details}
                    </p>
                )}
            </div>
        </li>
    )
}

export default function CreditCardsStatusTimeline({
    data,
}: {
    data: SuccessOrderStatusHistoryResponse
}) {
    const chronological = [...data.statusList].reverse()

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* id="order-id" must be a <p> tag — loadgen uses //p[@id="order-id"] */}
            <p id="order-id" style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Order ID:{" "}
                <span style={{ fontFamily: "monospace" }} data-dt-mask>
                    {data.orderId}
                </span>
            </p>

            <ol className="timeline">
                {chronological.map((entry, idx) => (
                    <TimelineEntry key={entry.timestamp + idx} {...entry} />
                ))}
            </ol>
        </div>
    )
}

import React from "react"
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
} from "@mui/lab"
import {
    OrderStatusEntry,
    SuccessOrderStatusHistoryResponse,
} from "../../api/creditCard/order"
import { Stack, Typography } from "@mui/material"
import { useFormatter } from "../../contexts/FormatterContext/context"

function TimelineEntry({ timestamp, status, details }: OrderStatusEntry) {
    const { formatDate } = useFormatter()
    return (
        <TimelineItem>
            <TimelineOppositeContent>
                <Typography variant="body2" color="text.secondary">
                    {formatDate(Date.parse(timestamp))}
                </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
                <Typography
                    variant="h6"
                    component="span"
                    sx={{ fontWeight: 700 }}
                >
                    {status
                        .split("_")
                        .map(
                            ([head, ...tail]) =>
                                `${head.toLocaleUpperCase()}${tail
                                    .join("")
                                    .toLocaleLowerCase()}`
                        )
                        .join(" ")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {details}
                </Typography>
            </TimelineContent>
        </TimelineItem>
    )
}

export default function CreditCardsStatusTimeline({
    data,
}: {
    data: SuccessOrderStatusHistoryResponse
}) {
    return (
        <Stack spacing={1}>
            <Typography id="order-id">
                Order ID:{" "}
                <Typography
                    component={"span"}
                    sx={{ fontFamily: "monospace" }}
                    data-dt-mask
                >
                    {data.orderId}
                </Typography>
            </Typography>
            <Timeline position="right">
                {data.statusList
                    .map((entry, id) => <TimelineEntry key={id} {...entry} />)
                    .reverse()}
            </Timeline>
        </Stack>
    )
}

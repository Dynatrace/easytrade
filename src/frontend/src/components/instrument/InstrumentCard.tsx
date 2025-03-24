import React from "react"
import {
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from "@mui/material"
import { Link } from "react-router"
import PriceDisplay from "./PriceDisplay"
import { grey } from "@mui/material/colors"
import { Price } from "../../api/backend/prices"
import { InstrumentPrice } from "../../api/instrument/types"

type Props = {
    id: string
    code: string
    name: string
    price: Price | InstrumentPrice
    amount: number
}

export default function InstrumentCard({
    id,
    code,
    price,
    name,
    amount,
}: Props) {
    return (
        <Card
            sx={{ height: "100%" }}
            className={`instrument-card${
                amount > 0 ? " owned-instrument" : ""
            }`}
        >
            <CardActionArea
                component={Link}
                to={`/instruments/${id}`}
                sx={{
                    padding: 1,
                    height: "100%",
                }}
            >
                <Stack height={"100%"} justifyContent={"space-between"}>
                    <CardHeader
                        title={code}
                        subheader={name}
                        slotProps={{
                            subheader: {
                                sx: {
                                    fontStyle: "italic",
                                },
                            },
                            title: {
                                sx: {
                                    fontFamily: "monospace",
                                    fontWeight: 600,
                                    color: "inherit",
                                    textDecoration: "none",
                                },
                                "data-dt-name": "Instrument symbol",
                            },
                            root: {
                                "data-dt-children-name": "Instrument name",
                            },
                        }}
                    />
                    <CardContent>
                        <Stack justifyContent="space-between" spacing={1}>
                            <PriceDisplay price={price} />
                            <Typography
                                variant="h5"
                                color={grey[300]}
                                sx={{
                                    fontWeight: 600,
                                }}
                                data-dt-name={"Instrument volume"}
                            >
                                {amount.toLocaleString("en-US")}
                            </Typography>
                        </Stack>
                    </CardContent>
                </Stack>
            </CardActionArea>
        </Card>
    )
}

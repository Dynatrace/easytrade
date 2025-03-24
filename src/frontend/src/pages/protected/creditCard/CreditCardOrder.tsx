import React from "react"
import { Card, CardContent, Stack } from "@mui/material"
import CreditCardForm from "../../../components/creditCard/CreditCardForm"
import DemoAppWarning from "../../../components/DemoAppWarning"

export default function CreditCardOrder() {
    return (
        <Card sx={{ padding: 1, maxWidth: "450px" }}>
            <CardContent>
                <Stack justifyContent="center" alignItems="center" spacing={2}>
                    <DemoAppWarning />
                    <CreditCardForm />
                </Stack>
            </CardContent>
        </Card>
    )
}

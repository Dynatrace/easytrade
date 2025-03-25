import React from "react"
import { Card, CardContent, Stack } from "@mui/material"
import DepositForm from "../../components/forms/DepositForm"
import DemoAppWarning from "../../components/DemoAppWarning"
import { deposit } from "../../api/creditCard/deposit/deposit"

export default function Deposit() {
    return (
        <Card
            sx={{
                margin: "auto",
                maxWidth: "450px",
            }}
        >
            <CardContent>
                <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    direction={"column"}
                >
                    <DemoAppWarning />
                    <DepositForm submitHandler={deposit} />
                </Stack>
            </CardContent>
        </Card>
    )
}

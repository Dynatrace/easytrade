import React, { useState } from "react"
import { Card, CardContent, Stack, Tab, Tabs } from "@mui/material"
import DepositForm from "../../components/forms/DepositForm"
import BitcoinDepositForm from "../../components/forms/BitcoinDepositForm"
import DemoAppWarning from "../../components/DemoAppWarning"
import { deposit } from "../../api/creditCard/deposit/deposit"
import { depositBitcoin } from "../../api/bitcoin/deposit/deposit"

export default function Deposit() {
    const [tab, setTab] = useState(0)

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
                    <Tabs
                        value={tab}
                        onChange={(_, newValue) => setTab(newValue)}
                        variant="fullWidth"
                        sx={{ width: "100%" }}
                    >
                        <Tab label="Credit Card" />
                        <Tab label="Bitcoin" />
                    </Tabs>
                    {tab === 0 && <DepositForm submitHandler={deposit} />}
                    {tab === 1 && <BitcoinDepositForm submitHandler={depositBitcoin} />}
                </Stack>
            </CardContent>
        </Card>
    )
}

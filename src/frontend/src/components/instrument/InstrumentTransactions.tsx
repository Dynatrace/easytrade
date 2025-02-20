import { TabContext, TabList, TabPanel } from "@mui/lab"
import { Box, Card, Tab } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { ReactElement, useState } from "react"
import QuickBuyForm from "./forms/QuickBuyForm"
import QuickSellForm from "./forms/QuickSellForm"
import BuyForm from "./forms/BuyForm"
import SellForm from "./forms/SellForm"

enum FormId {
    QuickBuy = "quick-buy",
    QuickSell = "quick-sell",
    Buy = "buy",
    Sell = "sell",
}

function TabForm({
    panelId,
    component,
}: {
    panelId: string
    component: ReactElement
}) {
    return (
        <TabPanel value={panelId}>
            <Box display={"flex"} justifyContent={"center"}>
                {component}
            </Box>
        </TabPanel>
    )
}

export default function InstrumentTransactions() {
    const [formId, setFormId] = useState<FormId>(FormId.QuickBuy)
    return (
        <Grid container spacing={2}>
            <TabContext value={formId}>
                <Grid size={{ xs: 2 }}>
                    <Card>
                        <TabList
                            onChange={(event, value) => setFormId(value)}
                            orientation="vertical"
                        >
                            <Tab label="Quick Buy" value={FormId.QuickBuy} />
                            <Tab label="Quick Sell" value={FormId.QuickSell} />
                            <Tab label="Buy" value={FormId.Buy} />
                            <Tab label="Sell" value={FormId.Sell} />
                        </TabList>
                    </Card>
                </Grid>
                <Grid size={{ xs: 10 }}>
                    <Card>
                        <TabForm
                            panelId={FormId.QuickBuy}
                            component={<QuickBuyForm />}
                        />
                        <TabForm
                            panelId={FormId.QuickSell}
                            component={<QuickSellForm />}
                        />
                        <TabForm panelId={FormId.Buy} component={<BuyForm />} />
                        <TabForm
                            panelId={FormId.Sell}
                            component={<SellForm />}
                        />
                    </Card>
                </Grid>
            </TabContext>
        </Grid>
    )
}

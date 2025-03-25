import React from "react"
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid"
import { Stack, Typography } from "@mui/material"
import { Instrument } from "../api/instrument/types"
import { Price } from "../api/price/types"
import { Formatter } from "../contexts/FormatterContext/types"
import { useFormatter } from "../contexts/FormatterContext/context"

function getColumnData(
    priceFormatter: Formatter<number>
): GridColDef<Instrument>[] {
    return [
        {
            field: "code",
            headerName: "Code",
            flex: 1,
            align: "center",
            headerAlign: "center",
        },
        {
            field: "name",
            headerName: "Name",
            flex: 2,
            align: "center",
            headerAlign: "center",
        },
        { field: "amount", headerName: "Amount", type: "number", flex: 1 },
        {
            field: "price",
            headerName: "Current price",
            type: "number",
            flex: 2,
            valueFormatter: (price: Price) => priceFormatter(price.close),
        },
        {
            field: "totalValue",
            headerName: "Total value",
            type: "number",
            flex: 2,
            valueFormatter: (value: number) => priceFormatter(value),
            valueGetter: (_, row: Instrument) => row.amount * row.price.close,
        },
    ]
}

function CustomToolbar() {
    return (
        <Stack justifyContent="center" alignItems="center" sx={{ m: 1 }}>
            <Typography variant="h6">Owned assets</Typography>
            <GridToolbarContainer
                sx={{
                    width: "100%",
                }}
                data-dt-features="main-table,table-toolbar"
            >
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarQuickFilter />
            </GridToolbarContainer>
        </Stack>
    )
}

type InstrumentsTableProps = {
    instruments: Instrument[]
    disableVirtualization?: boolean
}

export default function InstrumentsTable({
    instruments,
    disableVirtualization = false,
}: InstrumentsTableProps) {
    const { formatCurrency } = useFormatter()
    const columnData = getColumnData(formatCurrency)
    return (
        <DataGrid
            rows={instruments.filter(({ amount }) => amount > 0)}
            columns={columnData}
            slots={{ toolbar: CustomToolbar }}
            hideFooter={true}
            disableVirtualization={disableVirtualization}
            data-dt-features="main-table"
        />
    )
}

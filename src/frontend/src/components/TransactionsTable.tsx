import React from "react"
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid"
import { Stack, Typography } from "@mui/material"
import { Transaction } from "../api/transaction/types"
import { Formatter } from "../contexts/FormatterContext/types"
import { useFormatter } from "../contexts/FormatterContext/context"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import { Instrument } from "../api/instrument/types"

function getColumnData(
    priceFormatter: Formatter<number>,
    dateFormatter: Formatter<number>
): GridColDef<Transaction>[] {
    return [
        {
            field: "actionType",
            headerName: "Buy/Sell",
            type: "singleSelect",
            valueOptions: ["BUY", "SELL"],
            flex: 1,
            align: "center",
            headerAlign: "center",
        },
        {
            field: "status",
            headerName: "Status",
            type: "singleSelect",
            valueOptions: ["ACTIVE", "SUCCESS", "FAIL"],
            flex: 1.5,
            align: "center",
            headerAlign: "center",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Stack direction={"row"}>
                    {params.value === "ACTIVE" ? (
                        <AutorenewIcon fontSize="small" color="info" />
                    ) : params.value === "SUCCESS" ? (
                        <CheckIcon fontSize="small" color="success" />
                    ) : (
                        <CloseIcon fontSize="small" color="error" />
                    )}
                    <Typography
                        variant="body2"
                        color={
                            params.value === "ACTIVE"
                                ? "info.main"
                                : params.value === "SUCCESS"
                                  ? "success.main"
                                  : "error.main"
                        }
                    >
                        {params.value}
                    </Typography>
                </Stack>
            ),
        },
        {
            field: "instrumentName",
            headerName: "Instrument",
            flex: 2,
            align: "center",
            headerAlign: "center",
        },
        { field: "amount", headerName: "Amount", type: "number", flex: 1.5 },
        {
            field: "price",
            headerName: "Price",
            type: "number",
            flex: 2,
            valueFormatter: (value: number) => priceFormatter(value),
        },
        {
            field: "total",
            headerName: "Total",
            type: "number",
            flex: 2,
            valueGetter: (_, transaction: Transaction) =>
                transaction.amount * transaction.price,
            valueFormatter: (value: number) => priceFormatter(value),
        },
        {
            field: "endTime",
            headerName: "End time",
            type: "dateTime",
            flex: 2,
            align: "center",
            headerAlign: "center",
            valueGetter: (_, transaction: Transaction) =>
                new Date(transaction.endTime),
            valueFormatter: (value: Date) => dateFormatter(value.getTime()),
        },
    ]
}

function CustomToolbar() {
    return (
        <Stack justifyContent="center" alignItems="center" sx={{ m: 1 }}>
            <Typography variant="h6">Transactions</Typography>
            <GridToolbarContainer
                sx={{
                    width: "100%",
                }}
            >
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarQuickFilter />
            </GridToolbarContainer>
        </Stack>
    )
}

type TransactionsTableProps = {
    transactions: Transaction[]
    instruments: Instrument[]
    disableVirtualization?: boolean
}

export default function TransactionsTable({
    transactions,
    instruments,
    disableVirtualization = false,
}: TransactionsTableProps) {
    const { formatCurrency, formatDate } = useFormatter()
    transactions = transactions.map((transaction) => {
        const instrument = instruments.find(
            (x) => x.id == transaction.instrumentName
        )
        if (instrument != undefined) {
            transaction.instrumentName = instrument.name
        }
        return transaction
    })
    return (
        <DataGrid
            rows={transactions}
            columns={getColumnData(formatCurrency, formatDate)}
            slots={{ toolbar: CustomToolbar }}
            initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableVirtualization={disableVirtualization}
        />
    )
}

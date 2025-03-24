import React from "react"
import "@testing-library/jest-dom"
import { screen, render } from "@testing-library/react"
import { FormatterWrapper } from "../providers"
import InstrumentsTable from "../../components/InstrumentsTable"
import { Instrument } from "../../api/instrument/types"

const mockInstruments: Instrument[] = [
    {
        id: "76",
        amount: 494,
        price: {
            timestamp: "2023-04-04T13:05:00Z",
            open: 137.68958333,
            high: 139.07805518,
            low: 136.37064957,
            close: 137.73125,
        },
        code: "ETRAVE",
        name: "EasyTravel",
        description: "EasyTravel Incorporated",
        productId: 1,
        productName: "Share",
    },
    {
        id: "77",
        amount: 768,
        price: {
            timestamp: "2023-04-04T13:05:00Z",
            open: 94.86888889,
            high: 95.44784334,
            low: 94.31277586,
            close: 94.91333333,
        },
        description: "EasyPlanes Worldwide",
        code: "EPLANE",
        name: "EasyPlanes",
        productId: 2,
        productName: "ETF",
    },
    {
        id: "78",
        amount: 828,
        price: {
            timestamp: "2023-04-04T13:05:00Z",
            open: 18.07583333,
            high: 18.27412251,
            low: 17.87590367,
            close: 18.0925,
        },
        code: "EHOTEL",
        name: "EasyHotels",
        productId: 3,
        productName: "Crypto",
        description: "EasyHotels International",
    },
    {
        id: "79",
        amount: 43015,
        price: {
            timestamp: "2023-04-04T13:05:00Z",
            open: 0.22982778,
            high: 0.23174109,
            low: 0.22786974,
            close: 0.22971667,
        },
        code: "EHOTEL",
        name: "EasyHotels",
        productId: 3,
        productName: "Crypto",
        description: "EasyHotels International",
    },
    {
        id: "80",
        amount: 36040,
        price: {
            timestamp: "2023-04-04T13:05:00Z",
            open: 0.27348264,
            high: 0.2754496,
            low: 0.27158477,
            close: 0.27355208,
        },
        code: "ETRAVE",
        name: "EasyTravel",
        description: "EasyTravel Incorporated",
        productId: 1,
        productName: "Share",
    },
]

describe("Instruments table", () => {
    test("displays full transaction data", () => {
        render(
            <FormatterWrapper>
                <InstrumentsTable
                    instruments={[mockInstruments[0]]}
                    disableVirtualization={true}
                />
            </FormatterWrapper>
        )

        expect(
            screen.getByRole("gridcell", { name: /etrave/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("gridcell", { name: /easytravel/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("gridcell", { name: /494/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("gridcell", { name: /137.73/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole("gridcell", { name: /68,039.24/i })
        ).toBeInTheDocument()
    })
    test("displays all rows", () => {
        render(
            <FormatterWrapper>
                <InstrumentsTable
                    instruments={mockInstruments}
                    disableVirtualization={true}
                />
            </FormatterWrapper>
        )
        expect(screen.getAllByRole("row", { name: /easy/i })).toHaveLength(5)
    })
})

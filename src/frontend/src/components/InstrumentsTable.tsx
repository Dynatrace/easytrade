import React from "react"
import { Instrument } from "../api/instrument/types"
import { useFormatter } from "../contexts/FormatterContext/context"

type InstrumentsTableProps = {
    instruments: Instrument[]
}

export default function InstrumentsTable({ instruments }: InstrumentsTableProps) {
    const { formatCurrency } = useFormatter()
    const owned = instruments.filter(({ amount }) => amount > 0)

    return (
        <div>
            <h3 className="section-heading">Owned assets</h3>
            {owned.length === 0 ? (
                <p className="empty-state">No owned instruments yet.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table
                        className="data-table"
                        data-dt-features="main-table"
                    >
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th className="col-number">Amount</th>
                                <th className="col-number">Price</th>
                                <th className="col-number">Total value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {owned.map((instrument) => (
                                <tr key={instrument.id}>
                                    <td>
                                        <span className="font-mono text-sm">
                                            {instrument.code}
                                        </span>
                                    </td>
                                    <td>{instrument.name}</td>
                                    <td className="col-number">
                                        {instrument.amount}
                                    </td>
                                    <td className="col-number">
                                        {formatCurrency(instrument.price.close)}
                                    </td>
                                    <td className="col-number">
                                        {formatCurrency(
                                            instrument.amount * instrument.price.close
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

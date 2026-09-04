import { useState } from "react"
import { Transaction } from "../api/transaction/types"
import { Instrument } from "../api/instrument/types"
import { useFormatter } from "../contexts/FormatterContext/context"
import { CheckIcon, CloseIcon, SyncIcon } from "./icons"

const PAGE_SIZE = 10

type TransactionsTableProps = {
    transactions: Transaction[]
    instruments: Instrument[]
}

function StatusBadge({ status }: { status: string }) {
    if (status === "SUCCESS") {
        return (
            <span className="badge badge-success">
                <CheckIcon width={12} height={12} />
                {status}
            </span>
        )
    }
    if (status === "FAIL") {
        return (
            <span className="badge badge-danger">
                <CloseIcon width={12} height={12} />
                {status}
            </span>
        )
    }
    return (
        <span className="badge badge-neutral">
            <SyncIcon width={12} height={12} />
            {status}
        </span>
    )
}

export default function TransactionsTable({
    transactions,
    instruments,
}: TransactionsTableProps) {
    const { formatCurrency, formatDate } = useFormatter()
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [directionFilter, setDirectionFilter] = useState<"" | "BUY" | "SELL">("")
    const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "SUCCESS" | "FAIL">("")

    const resolved = transactions.map((tx) => {
        const instrument = instruments.find((i) => String(i.id) === String(tx.instrumentName))
        return {
            ...tx,
            instrumentName: instrument?.name ?? tx.instrumentName,
        }
    })

    const filtered = resolved.filter((tx) => {
        if (directionFilter && tx.actionType !== directionFilter) return false
        if (statusFilter && tx.status !== statusFilter) return false
        if (search) {
            const q = search.toLowerCase()
            if (
                !tx.instrumentName.toLowerCase().includes(q) &&
                !tx.actionType.toLowerCase().includes(q) &&
                !tx.status.toLowerCase().includes(q)
            ) return false
        }
        return true
    })

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

    function resetPage() {
        setPage(0)
    }

    return (
        <div>
            <h3 className="section-heading">Transactions</h3>

            {/* Toolbar */}
            <div className="table-toolbar">
                <input
                    className="table-search"
                    type="search"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPage() }}
                />
                <select
                    className="table-filter-select"
                    value={directionFilter}
                    onChange={(e) => { setDirectionFilter(e.target.value as typeof directionFilter); resetPage() }}
                >
                    <option value="">All directions</option>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                </select>
                <select
                    className="table-filter-select"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); resetPage() }}
                >
                    <option value="">All statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAIL">FAIL</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <p className="empty-state">No transactions match the current filters.</p>
            ) : (
                <>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table" data-dt-features="transactions-table">
                            <thead>
                                <tr>
                                    <th>Direction</th>
                                    <th>Status</th>
                                    <th>Instrument</th>
                                    <th className="col-number">Amount</th>
                                    <th className="col-number">Price</th>
                                    <th className="col-number">Total</th>
                                    <th>End time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slice.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <span
                                                className={
                                                    tx.actionType === "BUY"
                                                        ? "badge badge-success"
                                                        : "badge badge-danger"
                                                }
                                            >
                                                {tx.actionType}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td>{tx.instrumentName}</td>
                                        <td className="col-number">{tx.amount.toLocaleString()}</td>
                                        <td className="col-number">
                                            {formatCurrency(tx.price)}
                                        </td>
                                        <td className="col-number">
                                            {formatCurrency(tx.amount * tx.price)}
                                        </td>
                                        <td className="text-muted text-sm">
                                            {formatDate(new Date(tx.endTime).getTime())}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                ← Prev
                            </button>
                            <span>
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages - 1, p + 1))
                                }
                                disabled={page >= totalPages - 1}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

import { Price } from "../../api/price"
import { InstrumentPrice } from "../../api/instrument"
import { useFormatter } from "../../contexts/FormatterContext/context"
import { priceTrend } from "../../utils/priceTrend"

export default function PriceDisplay({
    price,
}: {
    price: Price | InstrumentPrice
}) {
    const { formatCurrency, formatPercent } = useFormatter()
    const { trendClass, pctChange } = priceTrend(price)

    return (
        <div
            className="instrument-card-price-row"
            data-dt-name="Instrument price"
            data-dt-children-name="Instrument variation"
        >
            <h5 id="instrumentPrice" className={`instrument-price ${trendClass}`}>
                {formatCurrency(price.close)}
            </h5>
            <span className={`instrument-pct ${trendClass}`}>
                {formatPercent(pctChange)}
            </span>
        </div>
    )
}

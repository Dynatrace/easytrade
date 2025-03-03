export type Formatter<T = unknown> = (value: T) => string

export type IFormatterContext = {
    formatCurrency: Formatter<number>
    formatPercent: Formatter<number>
    formatDate: Formatter<number>
    formatTime: Formatter<number>
}

export type FormatterProviderProps = {
    locale: string
    currency: string
}

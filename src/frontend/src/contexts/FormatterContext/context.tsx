import React from "react"
import { PropsWithChildren, createContext, useContext } from "react"
import { FormatterProviderProps, IFormatterContext } from "./types"

const milisecondsInMinute = 60 * 1000
const milisecondsInHour = 60 * 60 * 1000
const milisecondsInDay = 24 * 60 * 60 * 1000

const FormatterContext = createContext<IFormatterContext | undefined>(undefined)

export function FormatterProvider({
    locale,
    currency,
    children,
}: PropsWithChildren<FormatterProviderProps>) {
    const currencyFormatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
    })
    const smallCurrencyFormatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumSignificantDigits: 1,
    })
    const percentFormatter = new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
        signDisplay: "exceptZero",
    })

    const timeFormatter = new Intl.DateTimeFormat(locale, {
        timeStyle: "short",
    })

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
    })

    const relativeDateFormatter = new Intl.RelativeTimeFormat(locale)

    function formatCurrency(n: number) {
        const formatter = n < 0.01 ? smallCurrencyFormatter : currencyFormatter
        return formatter.format(n)
    }

    function formatPercent(n: number) {
        return percentFormatter.format(n)
    }

    function formatTime(n: number) {
        return timeFormatter.format(n)
    }

    function formatDate(n: number) {
        const timeDiff = n - Date.now()

        if (Math.abs(timeDiff) < milisecondsInHour) {
            return relativeDateFormatter.format(
                Math.floor(timeDiff / milisecondsInMinute),
                "minutes"
            )
        }
        if (Math.abs(timeDiff) < milisecondsInDay) {
            return relativeDateFormatter.format(
                Math.floor(timeDiff / milisecondsInHour),
                "hours"
            )
        }
        return dateFormatter.format(n)
    }

    return (
        <FormatterContext.Provider
            value={{
                formatCurrency,
                formatPercent,
                formatDate,
                formatTime,
            }}
        >
            {children}
        </FormatterContext.Provider>
    )
}

export function useFormatter() {
    const context = useContext(FormatterContext)
    if (context === undefined) {
        throw new Error(
            "Components using [useFormatter] hook need to be wrapped in [FormatterProvider]"
        )
    }
    return context
}

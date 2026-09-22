export type RegularVisits =
    | "deposit_and_long_buy_success"
    | "deposit_and_long_buy_timeout"
    | "deposit_and_long_buy_error"
    | "long_sell_success"
    | "long_sell_timeout"
    | "long_sell_error"
    | "deposit_and_buy_success"
    | "sell_and_withdraw_success"
export type RareVisits = "order_credit_card"
export type VisitName = RegularVisits | RareVisits

import { CREDIT_CARD_MAPPING } from "../const"

export interface User {
    first_name: string
    last_name: string
    username: string
    email: string
    password: string
    user_agent: string
    ip4: string
    address: string
    credit_card_number: string
    credit_card_cvv: string
    credit_card_provider: keyof typeof CREDIT_CARD_MAPPING
    visitor_id: string
}

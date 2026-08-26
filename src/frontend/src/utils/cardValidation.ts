export function isCreditCardValid(value: string): boolean {
    const digits = value.replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19) return false
    let sum = 0
    let isEven = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10)
        if (isEven) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
        isEven = !isEven
    }
    return sum % 10 === 0
}

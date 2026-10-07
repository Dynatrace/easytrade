import "@testing-library/jest-dom"
import { ReactElement } from "react"
import { screen, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Mock } from "vitest"
import { FormProviders } from "../providers"

type CardFormSuiteOptions = {
    title: string
    submitLabel: RegExp
    renderForm: (submitHandler: Mock) => ReactElement
    /** Fields only some card forms have (e.g. CVV), filled for the happy path. */
    fillExtraFields?: (user: ReturnType<typeof userEvent.setup>) => Promise<void>
    expectedExtraPayload?: Record<string, string>
}

const VALID_CARD_NUMBER = "2293562484488276"

export function describeCardForm({
    title,
    submitLabel,
    renderForm,
    fillExtraFields,
    expectedExtraPayload = {},
}: CardFormSuiteOptions) {
    describe(title, () => {
        let handler: Mock
        let user: ReturnType<typeof userEvent.setup>

        const input = (name: RegExp) => screen.getByLabelText(name)
        const submit = () => user.click(screen.getByRole("button", { name: submitLabel }))
        const expectErrorToast = async (message: RegExp) =>
            expect(await screen.findByRole("alert")).toHaveTextContent(message)

        async function fillValidForm() {
            await user.type(input(/amount/i), "1000")
            await user.type(input(/cardholder name/i), "testName")
            await user.type(input(/address/i), "test address")
            await user.type(input(/email/i), "email@test.com")
            await user.type(input(/card number/i), VALID_CARD_NUMBER)
            await user.selectOptions(input(/card type/i), "mastercard")
            await fillExtraFields?.(user)
            await user.click(input(/agree to terms and conditions/i))
        }

        beforeEach(() => {
            handler = vi.fn(() => Promise.resolve({}))
            user = userEvent.setup()
            render(renderForm(handler), { wrapper: FormProviders })
        })

        it("submit_validInputs_callsHandlerWithValues", async () => {
            await fillValidForm()
            await submit()

            await waitFor(() =>
                expect(handler).toBeCalledWith({
                    accountId: "1",
                    amount: 1000,
                    name: "testName",
                    address: "test address",
                    email: "email@test.com",
                    cardNumber: VALID_CARD_NUMBER,
                    cardType: "mastercard",
                    ...expectedExtraPayload,
                })
            )
        })

        it("submit_validInputs_showsSuccessToast", async () => {
            await fillValidForm()
            await submit()

            expect(await screen.findByRole("status")).toHaveTextContent(/successful/i)
        })

        it("submit_emptyInputs_showsAmountError", async () => {
            await submit()
            await expectErrorToast(/amount must be greater than 0/i)
        })

        it("submit_emptyInputs_doesNotCallHandler", async () => {
            await submit()
            await screen.findByRole("alert")
            expect(handler).not.toBeCalled()
        })

        it("submit_invalidCardNumber_showsCardNumberError", async () => {
            await fillValidForm()
            await user.clear(input(/card number/i))
            await user.type(input(/card number/i), "1111111111111111")
            await submit()
            await expectErrorToast(/invalid credit card number/i)
        })

        it("submit_handlerReturnsError_showsHandlerError", async () => {
            handler.mockResolvedValueOnce({ error: "handler failed" })
            await fillValidForm()
            await submit()
            await expectErrorToast(/handler failed/i)
        })
    })
}

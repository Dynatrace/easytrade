import React from "react"
import "@testing-library/jest-dom"
import { screen, render, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"
import { createMemoryRouter, RouterProvider } from "react-router"
import { Mock } from "vitest"
import WithdrawForm from "../../components/forms/WithdrawForm"
import { QueryClientWrapper, UserContextWrapper } from "../providers"
import { LoaderIds } from "../../router"
import { User, Balance } from "../../api/user/types"
import { FormatterProvider } from "../../contexts/FormatterContext/context"

function getAmountInput() {
    return screen.getByRole("spinbutton", { name: /amount/i })
}
function getCardholderNameInput() {
    return screen.getByRole("textbox", { name: /cardholder name/i })
}
function getAddressInput() {
    return screen.getByRole("textbox", { name: /address/i })
}
function getEmailInput() {
    return screen.getByRole("textbox", { name: /email/i })
}
function getCardNumberInput() {
    return screen.getByRole("textbox", { name: /card number/i })
}
function getCardTypeInput() {
    return screen.getByRole("combobox", { name: /card type/i })
}
function getAgreementCheckboxInput() {
    return screen.getByRole("checkbox", {
        name: /agree to terms and conditions/i,
    })
}
function getWithdrawButton() {
    return screen.getByRole("button", { name: /withdraw/i })
}

const userData: User = {
    email: "",
    firstName: "",
    id: "",
    lastName: "",
    packageType: "",
    address: "",
}

const balanceData: Balance = {
    accountId: "",
    value: 123,
}

describe("Withdraw Form", () => {
    let mockHandler: Mock
    let user: UserEvent
    beforeEach(async () => {
        mockHandler = vi.fn(() => Promise.resolve({}))
        user = userEvent.setup()
        const router = createMemoryRouter(
            [
                {
                    path: "/withdraw",
                    element: (
                        <FormatterProvider currency="USD" locale="en-US">
                            <QueryClientWrapper
                                getUser={() => Promise.resolve(userData)}
                                getBalance={() => Promise.resolve(balanceData)}
                            >
                                <UserContextWrapper>
                                    <WithdrawForm submitHandler={mockHandler} />
                                    ,
                                </UserContextWrapper>
                            </QueryClientWrapper>
                        </FormatterProvider>
                    ),
                    loader: () => {
                        return [userData, balanceData]
                    },
                    id: LoaderIds.user,
                },
            ],
            { initialEntries: ["/withdraw"] }
        )
        await act(() => render(<RouterProvider router={router} />))
    })
    describe("inputs are valid", () => {
        it("submits values", async () => {
            await user.type(getAmountInput(), "1000")
            await user.type(getCardholderNameInput(), "testName")
            await user.type(getAddressInput(), "test address")
            await user.type(getEmailInput(), "email@test.com")
            await user.type(getCardNumberInput(), "2293562484488276")
            await user.click(getCardTypeInput())
            await user.click(screen.getByText(/mastercard/i))
            await user.click(getAgreementCheckboxInput())
            await user.click(getWithdrawButton())

            await waitFor(() =>
                expect(mockHandler).toBeCalledWith({
                    accountId: 1,
                    amount: 1000,
                    name: "testName",
                    address: "test address",
                    email: "email@test.com",
                    cardNumber: "2293562484488276",
                    cardType: "mastercard",
                })
            )
        })
    })
    describe("when inputs are empty", () => {
        it("displays errors", async () => {
            await user.click(getWithdrawButton())
            expect(await screen.findAllByText(/required/i)).toHaveLength(5)
            expect(
                await screen.findByText(/must set card type/i)
            ).toBeInTheDocument()
            expect(
                await screen.findByText(/must agree to terms and conditions/i)
            ).toBeInTheDocument()
            expect(
                await screen.findByText(/amount must be greater than 0/i)
            ).toBeInTheDocument()
        })
        it("doesn't submit values", async () => {
            await user.click(getWithdrawButton())
            await waitFor(() => expect(mockHandler).not.toBeCalled())
        })
    })

    it("when amount is negative it displays error", async () => {
        fireEvent.input(getAmountInput(), {
            target: {
                value: -1000,
            },
        })
        await user.click(getWithdrawButton())
        expect(
            await screen.findByText(/amount must be greater than 0/i)
        ).toBeInTheDocument()
    })

    it("when email is invalid it displays error", async () => {
        await user.type(getEmailInput(), "invalid email")
        await user.click(getWithdrawButton())
        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    })

    it("when credit card number is invalid it displays error", async () => {
        await user.type(getCardNumberInput(), "1111111111111111")
        await user.click(getWithdrawButton())
        expect(
            await screen.findByText(/invalid credit card number/i)
        ).toBeInTheDocument()
    })
})

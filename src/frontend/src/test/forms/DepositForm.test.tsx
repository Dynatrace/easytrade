import React from "react"
import "@testing-library/jest-dom"
import { screen, render, fireEvent, waitFor, act } from "@testing-library/react"
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"
import { Mock } from "vitest"
import userEvent from "@testing-library/user-event"
import DepositForm from "../../components/forms/DepositForm"
import { createMemoryRouter, RouterProvider } from "react-router"
import { DepositHandler } from "../../api/creditCard/deposit/types"
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
function getCvvInput() {
    return screen.getByRole("textbox", { name: /cvv/i })
}
function getAgreementCheckboxInput() {
    return screen.getByRole("checkbox", {
        name: /agree to terms and conditions/i,
    })
}
function getDepositButton() {
    return screen.getByRole("button", { name: /deposit/i })
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

describe("Deposit Form", () => {
    let mockHandler: Mock<DepositHandler>
    let user: UserEvent
    beforeEach(async () => {
        mockHandler = vi.fn(() => Promise.resolve({}))
        user = userEvent.setup()
        const router = createMemoryRouter(
            [
                {
                    path: "/deposit",
                    element: (
                        <FormatterProvider currency="USD" locale="en-US">
                            <QueryClientWrapper
                                getUser={() => Promise.resolve(userData)}
                                getBalance={() => Promise.resolve(balanceData)}
                            >
                                <UserContextWrapper>
                                    <DepositForm submitHandler={mockHandler} />
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
            { initialEntries: ["/deposit"] }
        )
        await act(() => render(<RouterProvider router={router} />))
    })
    describe("inputs are valid", () => {
        it("calls handler function", async () => {
            await user.type(getAmountInput(), "1000")
            await user.type(getCardholderNameInput(), "testName")
            await user.type(getAddressInput(), "test address")
            await user.type(getEmailInput(), "email@test.com")
            await user.type(getCardNumberInput(), "2293562484488276")
            await user.click(getCardTypeInput())
            await user.click(screen.getByText(/mastercard/i))
            await user.type(getCvvInput(), "111")
            await user.click(getAgreementCheckboxInput())
            await user.click(getDepositButton())

            await waitFor(() =>
                expect(mockHandler).toBeCalledWith({
                    accountId: 1,
                    amount: 1000,
                    name: "testName",
                    address: "test address",
                    email: "email@test.com",
                    cardNumber: "2293562484488276",
                    cardType: "mastercard",
                    cvv: "111",
                })
            )
        })
    })
    describe("when inputs are empty", () => {
        it("displays errors", async () => {
            await user.click(getDepositButton())
            expect(await screen.findAllByText(/required/i)).toHaveLength(6)
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
            await user.click(getDepositButton())
            await waitFor(() => expect(mockHandler).not.toBeCalled())
        })
    })

    it("when amount is negative it displays error", async () => {
        fireEvent.input(getAmountInput(), {
            target: {
                value: -1000,
            },
        })
        await user.click(getDepositButton())
        expect(
            await screen.findByText(/amount must be greater than 0/i)
        ).toBeInTheDocument()
    })

    it("when email is invalid it displays error", async () => {
        await user.type(getEmailInput(), "invalid email")
        await user.click(getDepositButton())
        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    })

    it("when credit card number is invalid it displays error", async () => {
        await user.type(getCardNumberInput(), "1111111111111111")
        await user.click(getDepositButton())
        expect(
            await screen.findByText(/invalid credit card number/i)
        ).toBeInTheDocument()
    })

    it("when cvv is invalid it displays error", async () => {
        await user.type(getCvvInput(), "1")
        await user.click(getDepositButton())
        expect(await screen.findByText(/invalid cvv/i)).toBeInTheDocument()
    })
})

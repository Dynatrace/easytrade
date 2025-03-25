import React from "react"
import "@testing-library/jest-dom"
import { screen, render, waitFor } from "@testing-library/react"
import SignupForm from "../../components/forms/SignupForm"
import userEvent from "@testing-library/user-event"
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"
import { Mock } from "vitest"
import { QueryClientWrapper } from "../providers"

function getSubmitButton() {
    return screen.getByRole("button")
}
function getFirstNameInput() {
    return screen.getByRole("textbox", { name: /first name/i })
}
function getLastNameInput() {
    return screen.getByRole("textbox", { name: /last name/i })
}
function getLoginInput() {
    return screen.getByRole("textbox", { name: /login/i })
}
function getEmailInput() {
    return screen.getByRole("textbox", { name: /email/i })
}
function getAddressInput() {
    return screen.getByRole("textbox", { name: /address/i })
}
function getPasswordInput() {
    return screen.getByLabelText(/^password$/i)
}
function getRepeatPasswordInput() {
    return screen.getByLabelText(/repeat password/i)
}

describe("Signup Form", () => {
    let mockHandler: Mock
    let user: UserEvent
    beforeEach(() => {
        mockHandler = vi.fn(() => Promise.resolve({}))
        user = userEvent.setup()
        render(<SignupForm submitHandler={mockHandler} />, {
            wrapper: QueryClientWrapper,
        })
    })
    describe("when input is valid", () => {
        it("submits values", async () => {
            await user.type(getFirstNameInput(), "firstName")
            await user.type(getLastNameInput(), "lastName")
            await user.type(getLoginInput(), "login")
            await user.type(getEmailInput(), "email@test.com")
            await user.type(getAddressInput(), "test address 12/34")
            await user.type(getPasswordInput(), "testPassword")
            await user.type(getRepeatPasswordInput(), "testPassword")
            await user.click(getSubmitButton())

            await waitFor(() =>
                expect(mockHandler).toBeCalledWith({
                    firstName: "firstName",
                    lastName: "lastName",
                    login: "login",
                    address: "test address 12/34",
                    email: "email@test.com",
                    password: "testPassword",
                })
            )
        })
    })
    describe("when input is empty", () => {
        it("displays errors", async () => {
            await userEvent.click(getSubmitButton())
            expect(await screen.findAllByText(/required/i)).toHaveLength(7)
        })
        it("doesn't submit values", async () => {
            await userEvent.click(getSubmitButton())
            await waitFor(() => expect(mockHandler).not.toBeCalled())
        })
    })
    it("when email is invalid it displays error", async () => {
        await user.type(getEmailInput(), "invalid email")
        await user.click(getSubmitButton())
        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
    })

    it("when passwords don't match it displays error", async () => {
        await user.type(getPasswordInput(), "first password")
        await user.type(getRepeatPasswordInput(), "second password")
        await user.click(getSubmitButton())
        expect(
            await screen.findByText(/passwords have to match/i)
        ).toBeInTheDocument()
    })
})

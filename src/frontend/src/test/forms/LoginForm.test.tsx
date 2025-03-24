import React from "react"
import "@testing-library/jest-dom"
import { screen, render, waitFor } from "@testing-library/react"
import LoginForm from "../../components/forms/LoginForm"
import userEvent from "@testing-library/user-event"
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"
import { Mock } from "vitest"
import { QueryClientWrapper } from "../providers"

const successMockImpl = () => ({})
const failMockImpl = () => ({ error: "fail" })

function getLoginInput() {
    return screen.getByRole("textbox", { name: /login/i })
}
function getPasswordInput() {
    return screen.getByLabelText(/password/i)
}
function getSubmitButton() {
    return screen.getByRole("button")
}

describe("Login Form", () => {
    let mockHandler: Mock
    let user: UserEvent
    beforeEach(() => {
        mockHandler = vi.fn(successMockImpl)
        user = userEvent.setup()
        render(<LoginForm submitHandler={mockHandler} />, {
            wrapper: QueryClientWrapper,
        })
    })
    describe("when input is empty", () => {
        it("displays errors", async () => {
            await user.click(getSubmitButton())
            expect(await screen.findAllByText(/required/i)).toHaveLength(2)
        })
        it("doesn't submit values", async () => {
            await user.click(getSubmitButton())
            await waitFor(() => expect(mockHandler).not.toBeCalled())
        })
    })
    describe("when input is valid", () => {
        it("submits values", async () => {
            await user.type(getLoginInput(), "testUser")
            await user.type(getPasswordInput(), "testPassword")
            await user.click(getSubmitButton())

            await waitFor(() =>
                expect(mockHandler).toBeCalledWith("testUser", "testPassword")
            )
        })
    })
    describe("given handler returns error", () => {
        beforeEach(() => {
            mockHandler.mockImplementationOnce(failMockImpl)
        })
        it("displays error from handler", async () => {
            await user.type(getLoginInput(), "testUser")
            await user.type(getPasswordInput(), "testPassword")
            await user.click(getSubmitButton())

            expect(await screen.findByText(/fail/i)).toBeInTheDocument()
        })
        it("when error is displayed and user types the error is removed", async () => {
            await user.type(getLoginInput(), "testUser")
            await user.type(getPasswordInput(), "testPassword")
            await user.click(getSubmitButton())

            await waitFor(async () => await screen.findByText(/fail/i))

            await user.type(getLoginInput(), "anything")

            expect(screen.queryByText(/fail/i)).not.toBeInTheDocument()
        })
    })
})

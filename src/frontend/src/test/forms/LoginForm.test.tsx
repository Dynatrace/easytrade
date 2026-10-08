import "@testing-library/jest-dom/vitest"
import { PropsWithChildren } from "react"
import { screen, render, waitFor } from "@testing-library/react"
import LoginForm from "../../components/forms/LoginForm"
import userEvent from "@testing-library/user-event"
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"
import { Mock } from "vitest"
import { QueryClientWrapper, ToastWrapper } from "../providers"

function LoginFormProviders({ children }: PropsWithChildren) {
    return (
        <QueryClientWrapper>
            <ToastWrapper>{children}</ToastWrapper>
        </QueryClientWrapper>
    )
}

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
            wrapper: LoginFormProviders,
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

            expect(await screen.findByRole("alert")).toHaveTextContent(/fail/i)
        })
    })
})

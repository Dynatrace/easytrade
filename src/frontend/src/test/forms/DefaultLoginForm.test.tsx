import React from "react"
import "@testing-library/jest-dom"
import { screen, render, waitFor } from "@testing-library/react"
import DefaultLoginForm from "../../components/forms/DefaultLoginForm"
import userEvent from "@testing-library/user-event"
import { PresetUser } from "../../api/user/types"

const mockUsers: PresetUser[] = [
    { id: "1", firstName: "first", lastName: "user" },
    { id: "2", firstName: "second", lastName: "user" },
    { id: "3", firstName: "third", lastName: "user" },
]

test("is disabled when passed empty list of users", () => {
    render(<DefaultLoginForm users={[]} submitHandler={vi.fn()} />)
    expect(screen.getByRole("combobox", { name: /^user/i })).toHaveAttribute(
        "aria-disabled",
        "true"
    )
    expect(screen.getByRole("button", { name: /log in as/i })).toHaveAttribute(
        "disabled"
    )
})

test("returns id of chosen user", async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn()
    render(<DefaultLoginForm users={mockUsers} submitHandler={mockHandler} />)

    await user.click(screen.getByRole("combobox", { name: /^user/i }))
    await user.click(screen.getByText(/second user/i))
    await user.click(
        screen.getByRole("button", {
            name: /log in as/i,
        })
    )

    await waitFor(() =>
        expect(mockHandler).toBeCalledWith({
            userId: "2",
        })
    )
})

test("selects first passed user by default", async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn()
    render(<DefaultLoginForm users={mockUsers} submitHandler={mockHandler} />)

    await user.click(
        screen.getByRole("button", {
            name: /log in as/i,
        })
    )

    await waitFor(() =>
        expect(mockHandler).toBeCalledWith({
            userId: "1",
        })
    )
})

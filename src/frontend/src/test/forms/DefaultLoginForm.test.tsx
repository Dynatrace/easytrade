import "@testing-library/jest-dom/vitest"
import { screen, render, waitFor } from "@testing-library/react"
import DefaultLoginForm from "../../components/forms/DefaultLoginForm"
import userEvent from "@testing-library/user-event"
import { PresetUser } from "../../api/user"

const mockUsers: PresetUser[] = [
    { id: "1", firstName: "first", lastName: "user" },
    { id: "2", firstName: "second", lastName: "user" },
    { id: "3", firstName: "third", lastName: "user" },
]

const getUserSelect = () => screen.getByRole("combobox", { name: /^user/i })
const getSubmitButton = () => screen.getByRole("button", { name: /log in as/i })

describe("DefaultLoginForm", () => {
    it("render_emptyUserList_disablesSelectAndSubmit", () => {
        render(<DefaultLoginForm users={[]} submitHandler={vi.fn()} />)
        expect(getUserSelect()).toBeDisabled()
        expect(getSubmitButton()).toBeDisabled()
    })

    it("submit_userChosen_passesChosenUserId", async () => {
        const user = userEvent.setup()
        const handler = vi.fn()
        render(<DefaultLoginForm users={mockUsers} submitHandler={handler} />)

        await user.selectOptions(getUserSelect(), "2")
        await user.click(getSubmitButton())

        await waitFor(() => expect(handler).toHaveBeenCalledWith({ userId: "2" }))
    })

    it("submit_noUserChosen_passesFirstUserId", async () => {
        const user = userEvent.setup()
        const handler = vi.fn()
        render(<DefaultLoginForm users={mockUsers} submitHandler={handler} />)

        await user.click(getSubmitButton())

        await waitFor(() => expect(handler).toHaveBeenCalledWith({ userId: "1" }))
    })
})

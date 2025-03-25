import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import {
    useTheme,
    ThemeProvider,
} from "../../contexts/ThemeContext/ThemeContext"
import userEvent from "@testing-library/user-event"

function TestComponent() {
    const { isDarkTheme, toggleTheme } = useTheme()
    return (
        <>
            <button onClick={toggleTheme}>toggle theme</button>
            {isDarkTheme ? <p>theme is dark</p> : <p>theme is light</p>}
        </>
    )
}

test("context can be use without provider", () => {
    render(<TestComponent />)
})
test("uses theme set in provider", () => {
    render(
        <ThemeProvider initialTheme="light">
            <TestComponent />
        </ThemeProvider>
    )
    expect(screen.getByText(/theme is light/i)).toBeInTheDocument()
})
test("toggling the theme changes the theme in context", async () => {
    const user = userEvent.setup()
    render(
        <ThemeProvider initialTheme="dark">
            <TestComponent />
        </ThemeProvider>
    )
    await user.click(screen.getByRole("button", { name: /toggle theme/i }))
    expect(screen.getByText(/theme is light/i)).toBeInTheDocument()
})
test("toggling the theme twice goes back to original theme", async () => {
    const user = userEvent.setup()
    render(
        <ThemeProvider initialTheme="dark">
            <TestComponent />
        </ThemeProvider>
    )
    await user.click(screen.getByRole("button", { name: /toggle theme/i }))
    await user.click(screen.getByRole("button", { name: /toggle theme/i }))
    expect(screen.getByText(/theme is dark/i)).toBeInTheDocument()
})

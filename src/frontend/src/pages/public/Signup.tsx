import React from "react"
import { Link } from "react-router"
import { signup } from "../../api/signup/signup"
import SignupForm from "../../components/forms/SignupForm"
import DemoAppWarning from "../../components/DemoAppWarning"

export default function Signup() {
    return (
        <div style={{ width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "var(--space-5)" }}>Sign up</h2>
            <DemoAppWarning />
            <div style={{ marginTop: "var(--space-5)" }}>
                <SignupForm submitHandler={signup} />
            </div>
            <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-sm)" }}>
                <Link to="/login">Already have an account? Log in</Link>
            </p>
        </div>
    )
}

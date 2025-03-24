import React from "react"
import { Card, CardContent, Link, Stack } from "@mui/material"
import { Link as RouterLink } from "react-router"
import { signup } from "../../api/signup/signup"
import SignupForm from "../../components/forms/SignupForm"
import DemoAppWarning from "../../components/DemoAppWarning"

export default function Signup() {
    return (
        <Card
            sx={{
                margin: "auto",
                minWidth: "300px",
                maxWidth: "450px",
            }}
        >
            <CardContent>
                <Stack spacing={2} alignItems="center" justifyContent="center">
                    <DemoAppWarning />
                    <SignupForm submitHandler={signup} />
                    <Link component={RouterLink} to="/login">
                        Log in
                    </Link>
                </Stack>
            </CardContent>
        </Card>
    )
}

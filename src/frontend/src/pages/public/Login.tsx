import React from "react"
import { Card, Divider, Link, Stack, CardContent } from "@mui/material"
import { Link as RouterLink, useLoaderData } from "react-router"
import { PresetUser } from "../../api/user/types"
import DefaultLoginForm from "../../components/forms/DefaultLoginForm"
import LoginForm from "../../components/forms/LoginForm"
import { useAuth } from "../../contexts/AuthContext/context"
import { usePresetUsersQuery } from "../../contexts/QueryContext/user/hooks"

export default function Login() {
    const { loginHandler, defaultLoginHandler } = useAuth()
    const initialData: PresetUser[] = useLoaderData()
    const { data } = usePresetUsersQuery(initialData)

    return (
        <Card
            sx={{ width: "40%", margin: "auto", padding: 2, minWidth: "500px" }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="baseline"
                    justifyContent="space-evenly"
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <Stack spacing={2} alignItems="center">
                        <LoginForm submitHandler={loginHandler} />
                        <Link component={RouterLink} to="/signup">
                            Sign up
                        </Link>
                    </Stack>
                    <DefaultLoginForm
                        users={data ?? []}
                        submitHandler={({ userId }) =>
                            defaultLoginHandler(userId)
                        }
                    />
                </Stack>
            </CardContent>
        </Card>
    )
}

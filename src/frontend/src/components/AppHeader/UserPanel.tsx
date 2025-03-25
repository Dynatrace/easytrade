import React from "react"
import { Logout } from "@mui/icons-material"
import {
    Avatar,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext/context"
import { useUserQuery } from "../../contexts/QueryContext/user/hooks"
import { User } from "../../api/user/types"
import { useRouteLoaderData } from "react-router"
import { LoaderIds } from "../../router"
import { logoutInvalidateQuery } from "../../contexts/QueryContext/user/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"

function GreetingWithSkeleton({
    firstName,
}: {
    firstName: string | undefined
}) {
    return firstName ? (
        <Typography data-dt-mask>Hi, {firstName}</Typography>
    ) : (
        <Skeleton>
            <Typography>Hi, username</Typography>
        </Skeleton>
    )
}

function AvatarWithSkeleton({ token }: { token: string | undefined }) {
    return token ? (
        <Avatar>{token[0]}</Avatar>
    ) : (
        <Skeleton variant="circular">
            <Avatar />
        </Skeleton>
    )
}

export default function UserPanel() {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const { userId, logoutHandler } = useAuth()

    const initialData = useRouteLoaderData(LoaderIds.user) as [() => User] // Get initial data as array of 2 async functions
    const initialUser = initialData ? initialData[0]() : undefined // If they exist, call the first on the retreive the user data

    const data = userId ? useUserQuery(userId, initialUser).data : undefined

    function handleClick(element: HTMLElement) {
        setMenuAnchor(element)
    }

    function handleClose() {
        setMenuAnchor(null)
    }

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        mutationFn: async () => {
            const { error } = await logoutHandler(userId ?? "")
            if (error !== undefined) {
                throw error
            }
        },
        onMutate: handleClose,
        onSuccess: () => {
            logoutInvalidateQuery(queryClient)
        },
        onError: (error) => {
            console.error(`There was an error during logout: ${error}`)
        },
    })

    return (
        <>
            <Stack direction="row" alignItems="center" spacing={3}>
                <GreetingWithSkeleton firstName={data?.firstName} />
                <IconButton
                    id="profileToggler"
                    onClick={({ currentTarget }) => handleClick(currentTarget)}
                >
                    <AvatarWithSkeleton token={data?.firstName} />
                </IconButton>
            </Stack>
            <Menu
                anchorEl={menuAnchor}
                open={!!menuAnchor}
                onClose={handleClose}
                onClick={handleClose}
            >
                <MenuItem
                    id="logoutItem"
                    onClick={() => {
                        mutate()
                    }}
                >
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </>
    )
}

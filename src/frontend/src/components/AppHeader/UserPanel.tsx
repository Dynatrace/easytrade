import React, { useState } from "react"
import { useAuth } from "../../contexts/AuthContext/context"
import { useUserQuery } from "../../contexts/QueryContext/user/hooks"
import { useRouteLoaderData } from "react-router"
import { LoaderIds } from "../../router"
import { logoutInvalidateQuery } from "../../contexts/QueryContext/user/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User, Balance } from "../../api/user/types"
import { LogoutIcon } from "../icons"

export default function UserPanel() {
    const [open, setOpen] = useState(false)
    const { userId, logoutHandler } = useAuth()

    // useRouteLoaderData returns null on public routes — cast defensively.
    const loaderData = useRouteLoaderData(LoaderIds.user) as [User?, Balance?] | null
    const initialUser = loaderData?.[0]
    const { data } = useUserQuery(userId ?? "", initialUser)

    const queryClient = useQueryClient()
    const { mutate } = useMutation({
        // eslint-disable-next-line @typescript-eslint/require-await -- useMutation requires async mutationFn
        mutationFn: async () => {
            logoutHandler()
        },
        onMutate: () => setOpen(false),
        onSuccess: () => {
            logoutInvalidateQuery(queryClient)
        },
    })

    return (
        <div className="profile-area">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                {data?.firstName && (
                    <span className="user-greeting" data-dt-mask>
                        Hi, {data.firstName}
                    </span>
                )}
                <button
                    id="profileToggler"
                    className="btn btn-ghost btn-icon"
                    onClick={() => setOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={open}
                >
                    <div className="avatar">
                        {data?.firstName?.[0] ?? "?"}
                    </div>
                </button>
            </div>

            {open && (
                <>
                    {/* Backdrop to close on outside click */}
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99,
                        }}
                        onClick={() => setOpen(false)}
                    />
                    <div className="profile-dropdown" style={{ zIndex: 100 }}>
                        <ul>
                            <li id="logoutItem">
                                <button
                                    onClick={() => mutate()}
                                >
                                    <LogoutIcon width={16} height={16} />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    )
}

import React, { useState } from "react"
import { PresetUser } from "../../api/user/types"

interface DefaultLoginFormProps {
    submitHandler: (data: { userId: string }) => void
    users: PresetUser[]
}

export default function DefaultLoginForm({
    submitHandler,
    users,
}: DefaultLoginFormProps) {
    const [selectedId, setSelectedId] = useState<string>(users[0]?.id ?? "")

    // Keep selection in sync when users load
    React.useEffect(() => {
        if (users.length > 0 && !selectedId) {
            setSelectedId(users[0].id)
        }
    }, [users])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (selectedId) {
            submitHandler({ userId: selectedId })
        }
    }

    const selectedUser = users.find((u) => u.id === selectedId)
    const isEmpty = users.length === 0

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="presetUser">
                    User
                </label>
                <select
                    id="presetUser"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={isEmpty}
                    aria-disabled={isEmpty ? "true" : undefined}
                >
                    {users.map(({ id, firstName, lastName }) => (
                        <option key={id} value={id}>
                            {firstName} {lastName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={isEmpty}
                >
                    Log in as {selectedUser?.firstName ?? "User"}
                </button>
            </div>
        </form>
    )
}

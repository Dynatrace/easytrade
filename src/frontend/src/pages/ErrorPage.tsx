import React from "react"
import { useRouteError } from "react-router"

export default function ErrorPage() {
    const error = useRouteError()

    function describeError(e: unknown): string {
        if (e instanceof Error) return e.message
        if (typeof e === "string") return e
        try { return JSON.stringify(e) } catch { return String(e) }
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem" }}>
            <div className="card" style={{ padding: "2rem", maxWidth: 600 }}>
                <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Oops! There was an error!</h2>
                <p style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--text-muted)", wordBreak: "break-word" }}>
                    {describeError(error)}
                </p>
            </div>
        </div>
    )
}

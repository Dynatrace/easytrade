import React from "react"
import { StatusDisplayContext } from "../hooks/useStatusDisplay"

export default function StatusDisplay({
    isError,
    isSuccess,
    successMsg,
    errorMsg,
}: StatusDisplayContext) {
    if (!isError() && !isSuccess()) return null
    return (
        <div>
            {isError() && (
                <div className="status-message status-error" role="alert">
                    {errorMsg()}
                </div>
            )}
            {isSuccess() && (
                <div className="status-message status-success" role="status">
                    {successMsg()}
                </div>
            )}
        </div>
    )
}

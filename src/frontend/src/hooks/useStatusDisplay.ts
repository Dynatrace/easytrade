import { useState } from "react"

export type StatusDisplayContext = {
    isSuccess: () => boolean
    isError: () => boolean
    successMsg: () => string
    errorMsg: () => string
    hasMsg: () => boolean
}

export type StatusDisplayActions = {
    setSuccess: (msg: string) => void
    setError: (msg: string) => void
    resetStatus: () => void
    statusContext: StatusDisplayContext
}

export default function useStatusDisplay(): StatusDisplayActions {
    const [successMsg, setSuccessMsg] = useState<string>("")
    const [errorMsg, setErrorMsg] = useState<string>("")

    function setSuccess(msg: string) {
        setSuccessMsg(msg)
        setErrorMsg("")
    }

    function setError(msg: string) {
        setSuccessMsg("")
        setErrorMsg(msg)
    }

    function resetState() {
        setSuccess("")
        setError("")
    }

    return {
        setSuccess,
        setError,
        resetStatus: resetState,
        statusContext: {
            isError: () => errorMsg !== "",
            isSuccess: () => successMsg !== "",
            hasMsg: () => errorMsg !== "" || successMsg !== "",
            successMsg: () => successMsg,
            errorMsg: () => errorMsg,
        },
    }
}

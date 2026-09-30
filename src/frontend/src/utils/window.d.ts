interface Window {
    dynatrace?: { sendBizEvent: (type: string, body: unknown) => void }
    dtrum?: { reportError: (error: unknown) => void }
}

import { createLogger, transports, format, Logger } from "winston"
const { combine, timestamp, printf, errors } = format

const TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss"
const DEFAULT_LOGGING_LEVEL = "debug"

function supressLogs(): boolean {
    return (process.env.NODE_ENV?.trim() ?? "") === "test"
}

const myFormat = printf(function ({ level, message, timestamp, stack }) {
    return `[${timestamp}] [${level.toUpperCase()}]: ${stack ?? message}`
})

const logger = createLogger({
    level: DEFAULT_LOGGING_LEVEL,
    format: errors({ stack: true }),
    transports: [
        new transports.Console({
            format: combine(timestamp({ format: TIMESTAMP_FORMAT }), myFormat),
        }),
    ],
    silent: supressLogs(),
})

function addMetadata(logger: Logger, metadata: object): void {
    logger.defaultMeta = { ...logger.defaultMeta, ...metadata }
}

function disableLogs() {
    logger.transports.forEach((t) => (t.silent = true))
}

export { logger, addMetadata, disableLogs }

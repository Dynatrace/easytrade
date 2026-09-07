import { createServer, IncomingMessage, Server, ServerResponse } from "node:http"

function writeResponse(response: ServerResponse, statusCode: number): void {
    response.statusCode = statusCode
    response.setHeader("Content-Type", "text/plain; charset=utf-8")
    response.end("OK")
}

export class HealthServer {
    private ready = false
    private readonly server: Server

    public constructor(private readonly healthPort: number) {
        this.server = createServer((request, response) => {
            this.handleRequest(request, response)
        })
        this.server.listen(this.healthPort)
    }

    public setReady(): void {
        this.ready = true
    }

    private handleRequest(request: IncomingMessage, response: ServerResponse): void {
        if (request.url === "/livez") {
            writeResponse(response, 200)
            return
        }

        if (request.url === "/readyz") {
            writeResponse(response, this.ready ? 200 : 503)
            return
        }

        response.statusCode = 404
        response.end()
    }
}

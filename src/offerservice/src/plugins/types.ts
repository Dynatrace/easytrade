import { ParamsDictionary } from "express-serve-static-core"
import { Response, Request, NextFunction } from "express"

export interface TypedRequestBody<P extends ParamsDictionary, B>
    extends Request {
    params: P
    body: B
}

export type PutPluginRequest = TypedRequestBody<
    { pluginName: string },
    { enabled: boolean }
>
export type GetPluginRequest = TypedRequestBody<
    { pluginName: string },
    { enabled: boolean }
>
export type RequestCallback = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>
export type ReleaseFunction = () => Promise<void>

export interface IPlugin {
    run(req: Request, res: Response): Promise<void>
    getName(): string
}

import type { NextFunction, Request, Response } from "express";
import type {
  ParamsDictionary,
  Query,
  RequestHandler,
  Response as Res,
} from "express-serve-static-core";

export type CustomRequestHandler<
  // biome-ignore lint/complexity/noBannedTypes: later fix
  B = {},
  P = ParamsDictionary,
  Q = Query,
  // biome-ignore lint/complexity/noBannedTypes: later fix
  R = {},
> = RequestHandler<P, R, B, Q>;
// biome-ignore lint/complexity/noBannedTypes: later fix
const asyncHandler = <B = {}, P = ParamsDictionary, Q = Query, R = Res>(
  requestHandler: CustomRequestHandler<B, P, Q, R>
): CustomRequestHandler<B, P, Q, R> => {
  return (req: Request<P, R, B, Q>, res: Response<R>, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };

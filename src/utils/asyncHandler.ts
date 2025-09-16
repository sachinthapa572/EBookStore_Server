// import { Request, Response, NextFunction, RequestHandler } from "express";

// const asyncHandler = <T extends RequestHandler>(requestHandler: T): T => {
//   return ((req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(requestHandler(req, res, next)).catch(next);
//   }) as T;
// };

// export { asyncHandler };

import { NextFunction, Request, RequestHandler, Response } from "express";

// Fully typed asyncHandler
export function asyncHandler<Params = {}, ResBody = any, ReqBody = any, ReqQuery = {}>(
  handler: (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<any>
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

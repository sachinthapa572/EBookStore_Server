import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = <T extends RequestHandler>(requestHandler: T): T => {
  return ((req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  }) as T;
};

export { asyncHandler };

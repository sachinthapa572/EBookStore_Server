import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";

const asyncHandlerWithTransaction = <T extends RequestHandler>(requestHandler: T): T => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    res.locals.session = session;

    try {
      await requestHandler(req, res, next);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }) as T;
};

export { asyncHandlerWithTransaction };

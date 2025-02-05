import { NextFunction, Request, Response } from "express";
import { EApplicationEnvironment } from "../constant/application";
import { rateLimiterMongo } from "../config/rateLimiter";
import responseMessage from "../constant/responseMessage";
import ApiError from "@/utils/ApiError";
import { HttpStatusCode } from "@/constant";
import { appEnv } from "@/config/env";

export default (req: Request, _: Response, next: NextFunction) => {
  if (appEnv.NODE_ENV === EApplicationEnvironment.DEVELOPMENT) {
    return next();
  }

  if (rateLimiterMongo) {
    rateLimiterMongo
      .consume(req.ip as string, 1)
      .then(() => {
        next();
      })
      .catch(() => {
        throw new ApiError(
          HttpStatusCode.TOO_MANY_REQUESTS,
          responseMessage.TOO_MANY_REQUESTS
        );
      });
  }
};

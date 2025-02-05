import { NextFunction, Request, Response } from "express";

import { EApplicationEnvironment, responseMessage } from "@/enum";
import { rateLimiterMongo, appEnv } from "@/config";
import { ApiError } from "@/utils";
import { HttpStatusCode } from "@/constant";

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

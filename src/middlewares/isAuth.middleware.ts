import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { ApiError } from "@/utils/ApiError";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";
import { formatUserProfile } from "@/utils/helper";

import { BEARER_TOKEN_REGEX } from "./refreshToken.middleware";
import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import { UserModel } from "@/model/user/user.model";

const verifyJWT: RequestHandler = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace(BEARER_TOKEN_REGEX, "");

    if (!token) {
      return next(
        new ApiError(
          HttpStatusCode.Unauthorized,
          "Authentication required. Please provide a valid access token"
        )
      );
    }

    // Verify the token and decode the payload
    const decodedToken = jwt.verify(token, appEnv.ACCESS_TOKEN_SECRET) as Request["user"];

    if (!decodedToken?._id) {
      return next(
        new ApiError(
          HttpStatusCode.Unauthorized,
          "Authentication failed. Invalid token format"
        )
      );
    }

    const user = await UserModel.findById(decodedToken._id);

    if (!user) {
      return next(
        new ApiError(
          HttpStatusCode.Unauthorized,
          "Authentication failed. User no longer exists"
        )
      );
    }

    req.user = formatUserProfile(user);
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError") {
        return next(
          new ApiError(
            HttpStatusCode.Unauthorized,
            "Authentication failed. The token is invalid"
          )
        );
      }
      if (error.name === "TokenExpiredError") {
        return next(
          new ApiError(
            HttpStatusCode.Unauthorized,
            "Authentication failed. The token has expired"
          )
        );
      }
      return next(
        new ApiError(
          HttpStatusCode.InternalServerError,
          "An unexpected error occurred during authentication"
        )
      );
    }
    return next(
      new ApiError(
        HttpStatusCode.InternalServerError,
        "An unexpected error occurred during authentication"
      )
    );
  }
};

export const isPurchaseByTheUser: CustomRequestHandler<object, { bookId: string }> =
  asyncHandler(async (req, _res, next) => {
    const userDoc = await UserModel.findOne({
      _id: req.user._id,
      books: req.params.bookId,
    }).lean();

    if (!userDoc) {
      return next(
        new ApiError(
          HttpStatusCode.Forbidden,
          "Access denied. This action requires prior purchase of the book"
        )
      );
    }
    next();
  });

export { verifyJWT as isAuth };

import { appEnv } from "@/config/env";
import UserModel from "@/model/user/user.model";
import { customReqHandler, newReviewType } from "@/types";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { formatUserProfile } from "@/utils/helper";
import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

// The middleware function to verify JWT
const verifyJWT: RequestHandler = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s*/, "").trim();

    if (!token) {
      return next(new ApiError(401, "Unauthorized request: No token provided"));
    }

    // Verify the token and decode the payload
    const decodedToken = jwt.verify(token, appEnv.ACCESS_TOKEN_SECRET) as Request["user"];

    if (!decodedToken?._id) {
      return next(new ApiError(401, "Unauthorized request: Invalid token"));
    }

    const user = await UserModel.findById(decodedToken._id);

    if (!user) {
      return next(new ApiError(401, "Unauthorized request: Invalid token"));
    }

    req.user = formatUserProfile(user);
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return next(
          new ApiError(401, "Unauthorized request: Invalid or expired access token")
        );
      }
      return next(new ApiError(500, "Internal Server Error"));
    }
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export const isPurchaseByTheUser: customReqHandler<newReviewType> = asyncHandler(
  async (req, _res, next) => {
    const userDoc = await UserModel.findOne({
      _id: req.user._id,
      books: req.body.bookId,
    });

    if (!userDoc) {
      return next(new ApiError(403, "Forbidden request: You have not purchased this book"));
    }
    next();
  }
);

export { verifyJWT as isAuth };

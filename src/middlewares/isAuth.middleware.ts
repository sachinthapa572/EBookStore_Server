import { env } from "@/config/env";
import UserModel from "@/model/auth/user.model";
import ApiError from "@/utils/ApiError";
import { formatUserProfile } from "@/utils/helper";
import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";


// The middleware function to verify JWT
const verifyJWT: RequestHandler = async (req, _res, next) => {
  try {
    const token: string =
      req.cookies?.accessToken ||
      req
        .header("Authorization")
        ?.replace(/^Bearer\s*/, "")
        .trim();

    if (!token || token === "undefined") {
      next(new ApiError(401, "Unauthorized request: No token provided"));
    }

    // Verify the token and decode the payload
    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as Request["user"];

    if (!decodedToken?._id) {
      next(new ApiError(401, "Unauthorized request: Invalid token"));
    }

    // Convert _id from string to ObjectId

    const user = await UserModel.findById({
      _id: decodedToken._id,
    });

    if (user) {
      req.user = formatUserProfile(user);
    } else {
      return next(new ApiError(401, "Unauthorized request: Invalid token"));
    }
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

    // If the error is not an instance of Error, handle it generically
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export { verifyJWT as isAuth };

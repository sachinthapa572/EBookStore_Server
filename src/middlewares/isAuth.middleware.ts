import { env } from "@/config/env";
import UserModel from "@/model/auth/user.model";
import ApiError from "@/utils/ApiError";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb"; // Import ObjectId for type checking

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
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    // Verify the token and decode the payload
    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      _id: ObjectId;
    };

    // Ensure the _id exists and is of type string before converting to ObjectId
    const _id = decodedToken?._id;

    if (!_id) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    // Convert _id from string to ObjectId

    const user = await UserModel.findById(_id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    req.userId = user._id; // Assign the userId to the request
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return next(
          new ApiError(
            401,
            "Unauthorized request: Invalid or expired access token"
          )
        );
      }
      return next(new ApiError(500, "Internal Server Error"));
    }

    // If the error is not an instance of Error, handle it generically
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export { verifyJWT as isAuth };

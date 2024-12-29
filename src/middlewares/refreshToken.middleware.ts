import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

import { appEnv } from "@/config/env";
import { cookiesOptions } from "@/constant";
import ApiError from "@/utils/ApiError";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";

// Middleware to refresh the access token if it is missing but refresh token exists
const refreshTokenMiddleware: RequestHandler = async (req, res, next) => {
  const accessToken: string | undefined =
    req.cookies.accessToken || req.header("Authorization")?.replace(/^Bearer\s*/, "");
  const refreshToken: string | undefined =
    req.cookies.refreshToken || req.header("x-refresh-token");

  // Check if access token is missing but refresh token exists
  if (!accessToken && refreshToken) {
    try {
      const decodedToken = jwt.verify(refreshToken, appEnv.REFRESH_TOKEN_SECRET) as {
        _id: ObjectId;
      };

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAccessTokenAndRefreshToken(decodedToken._id);

      // Set the new accessToken and refreshToken in the response object
      res
        .cookie("accessToken", newAccessToken, cookiesOptions)
        .cookie("refreshToken", newRefreshToken, cookiesOptions);

      // Set the new accessToken in the request object
      req.cookies.accessToken = newAccessToken;
    } catch (error) {
      next(new ApiError(401, "Unauthorized: Unable to refresh token"));
    }
  }
  next();
};

export default refreshTokenMiddleware;

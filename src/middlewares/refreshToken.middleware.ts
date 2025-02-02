import { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

import { appEnv } from "@/config/env";
import { cookiesOptions } from "@/constant";
import ApiError from "@/utils/ApiError";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";

const refreshTokenMiddleware: RequestHandler = async (req, res, next) => {
  // Extract access token and refresh token from the request
  const { accessToken, refreshToken } = getTokensFromRequest(req);

  // Check if access token is missing but refresh token exists
  if (!accessToken && refreshToken) {
    try {
      // Verify the refresh token and extract the user ID
      const { _id } = await verifyRefreshToken(refreshToken);

      // Generate new access token and refresh token
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAccessTokenAndRefreshToken(_id);

      // Set the new tokens in the response
      setTokensInResponse(res, newAccessToken, newRefreshToken);

      // Set the new access token in the request
      req.cookies.accessToken = newAccessToken;
    } catch (error) {
      // Handle token verification error
      next(new ApiError(401, "Unauthorized: Unable to refresh token"));
    }
  }

  next();
};

export default refreshTokenMiddleware;

// Helper function to extract tokens from the request
function getTokensFromRequest(req: Request): {
  accessToken: string | undefined;
  refreshToken: string | undefined;
} {
  return {
    accessToken:
      req.cookies.accessToken || req.header("Authorization")?.replace(/^Bearer\s*/, ""),
    refreshToken: req.cookies.refreshToken || req.header("x-refresh-token"),
  };
}

// Helper function to verify the refresh token
async function verifyRefreshToken(refreshToken: string): Promise<{ _id: ObjectId }> {
  return jwt.verify(refreshToken, appEnv.REFRESH_TOKEN_SECRET) as { _id: ObjectId };
}

// Helper function to set the tokens in the response
function setTokensInResponse(res: Response, accessToken: string, refreshToken: string): void {
  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions);
}

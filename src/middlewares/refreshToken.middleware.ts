import { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

import { appEnv } from "@/config";
import { cookiesOptions } from "@/constant";
import { ApiError, generateAccessTokenAndRefreshToken } from "@/utils";

export const refreshTokenMiddleware: RequestHandler = async (req, res, next) => {
  const { accessToken, refreshToken } = getTokensFromRequest(req);

  if (!accessToken && refreshToken) {
    try {
      const { _id } = await verifyRefreshToken(refreshToken);

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateAccessTokenAndRefreshToken(_id);

      setTokensInResponse(res, newAccessToken, newRefreshToken);
      req.cookies.accessToken = newAccessToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new ApiError(401, "Authentication failed: Refresh token has expired"));
      } else if (error instanceof jwt.JsonWebTokenError) {
        return next(new ApiError(403, "Authentication failed: Invalid refresh token"));
      } else {
        return next(new ApiError(500, "Internal server error: Token refresh failed"));
      }
    }
  }

  next();
};

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

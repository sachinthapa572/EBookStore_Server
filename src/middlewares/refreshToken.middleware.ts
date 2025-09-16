import type { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { ObjectId } from "mongoose";

import { ApiError } from "@/utils/ApiError";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";

import { appEnv } from "@/config/env";
import { cookiesOptions, HttpStatusCode } from "@/constant";

// Regex pattern for Bearer token extraction - defined at top level for performance
export const BEARER_TOKEN_REGEX = /^Bearer\s*/;

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
        return next(
          new ApiError(
            HttpStatusCode.Unauthorized,
            "Authentication failed: Refresh token has expired"
          )
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(
          new ApiError(
            HttpStatusCode.Forbidden,
            "Authentication failed: Invalid refresh token"
          )
        );
      }
      return next(
        new ApiError(
          HttpStatusCode.InternalServerError,
          "Internal server error: Token refresh failed"
        )
      );
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
      req.cookies.accessToken || req.header("Authorization")?.replace(BEARER_TOKEN_REGEX, ""),
    refreshToken: req.cookies.refreshToken || req.header("x-refresh-token"),
  };
}

// Helper function to verify the refresh token
function verifyRefreshToken(refreshToken: string): { _id: ObjectId } {
  return jwt.verify(refreshToken, appEnv.REFRESH_TOKEN_SECRET) as {
    _id: ObjectId;
  };
}

// Helper function to set the tokens in the response
function setTokensInResponse(res: Response, accessToken: string, refreshToken: string): void {
  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions);
}

import type { RequestHandler } from "express";

import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { appEnv } from "@/config/env";
import { cookiesOptions, HttpStatusCode } from "@/constant";
import { authService } from "@/services/auth/auth.service";
import type { EmailType, UserIdType } from "@/validators/auth/auth.validation";

const generateAuthLink: CustomRequestHandler<EmailType> = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.generateAuthLink(email, res);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        result,
        "Verification link has been sent to your email address. Please check your inbox."
      )
    );
});

const verifyAuthToken: CustomRequestHandler<object, object, UserIdType> = asyncHandler(
  async (req, res) => {
    const { userId } = req.query;

    const { user, tokens } = await authService.verifyAuthToken(userId);

    res
      .status(HttpStatusCode.OK)
      .cookie("accessToken", tokens.accessToken, cookiesOptions)
      .cookie("refreshToken", tokens.refreshToken, cookiesOptions);

    // Redirect to the success URL
    res.redirect(
      `${appEnv.AUTH_SUCCESS_URL}?profile=${JSON.stringify(authService.formatUserForResponse(user))}`
    );
  }
);

const ProfileInfo: RequestHandler = asyncHandler((req, res) => {
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { profile: req.user },
        "Profile information retrieved successfully"
      )
    );
});

const logout: RequestHandler = asyncHandler((_req, res) => {
  res
    .status(HttpStatusCode.OK)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(HttpStatusCode.OK, null, "Logged out successfully"));
});

const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  const avatarFile =
    req.files?.avatar && !Array.isArray(req.files.avatar) ? req.files.avatar : null;

  const user = await authService.updateProfile(req.user._id, req.body, avatarFile);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { profile: authService.formatUserForResponse(user) },
        "Profile has been updated successfully"
      )
    );
});

export { generateAuthLink, logout, ProfileInfo, updateProfile, verifyAuthToken };

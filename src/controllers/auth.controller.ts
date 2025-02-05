import { ObjectId } from "mongoose";
import { RequestHandler } from "express";
import crypto from "crypto";

import { userDoc, UserModel, VerificationTokenModel } from "@/model";
import {
  ApiResponse,
  ApiError,
  asyncHandler,
  generateAccessTokenAndRefreshToken,
  formatUserProfile,
  updateAvatarToCloudinary,
} from "@/utils";
import { appEnv } from "@/config";
import { cookiesOptions, HttpStatusCode } from "@/constant";
import { EmailTemplate, mailService } from "@/services/email.service";

const generateAuthLink: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Use findOneAndUpdate to create or update the user
  const user = await UserModel.findOneAndUpdate(
    { email },
    { email },
    { upsert: true, new: true }
  ).lean();

  // Remove the existing verification token
  await VerificationTokenModel.deleteOne({ user: user._id });

  // Generate a new verification token
  const verificationToken = await VerificationTokenModel.create({
    user: user._id,
    token: crypto.randomBytes(36).toString("hex"),
  });

  if (!verificationToken) {
    throw new ApiError(500, "Token generation failed");
  }

  // Send the verification email
  const emailTemplate = EmailTemplate.VerificationTemplate(
    `${appEnv.SERVER_URL}/verify?userId=${verificationToken.token}`
  );
  await mailService.sendVerificatinMail({ email, res, emailTemplate });

  res.status(HttpStatusCode.OK).json(
    new ApiResponse(
      HttpStatusCode.OK,
      {
        email: user.email,
        link: `${appEnv.SERVER_URL}/verify?userId=${verificationToken.token}`,
      },
      "Verification link has been sent to your email address. Please check your inbox."
    )
  );
});

const verifyAuthToken: RequestHandler = asyncHandler(async (req, res) => {
  const { userId } = req.query as { userId: string };
  if (!userId || typeof userId !== "string") {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      "Invalid request: userId missing or invalid."
    );
  }

  // Retrieve the verification token and associated user
  const verificationToken = await VerificationTokenModel.findOne({ token: userId }).populate<{
    user: userDoc;
  }>("user");

  if (!verificationToken || !verificationToken.user) {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid or expired verification token.");
  }

  const user = verificationToken.user;

  // Check if the user exists in the database
  if (!(await UserModel.exists({ _id: user._id }))) {
    throw new ApiError(HttpStatusCode.NotFound, "User not found.");
  }

  if (!verificationToken.compareToken(userId)) {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid request: Token mismatch.");
  }

  // Mark the user as verified and save the user
  user.isVerified = true;
  await Promise.all([user.save(), VerificationTokenModel.deleteOne({ user: user._id })]);

  // Generate new access and refresh tokens for the user
  const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(
    user._id as ObjectId
  );

  // Set the access token in Redis
  // redis.setex(user._id.toString(), 60 * 60 * 24 * 30, accessToken);

  res
    .status(HttpStatusCode.OK)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { profile: formatUserProfile(user) },
        "Email verification successful. Welcome!"
      )
    );
  // Redirect to the success URL
  // res.redirect(`${env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(formatUserProfile(user))}`);
});

const ProfileInfo: RequestHandler = asyncHandler(async (req, res) => {
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

const logout: RequestHandler = asyncHandler(async (_req, res) => {
  res
    .status(HttpStatusCode.OK)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(HttpStatusCode.OK, null, "Logged out successfully"));
});

const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $set: { ...req.body, signedUp: true } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(HttpStatusCode.NotFound, "User not found.");
  }

  if (req.files?.avatar && !Array.isArray(req.files.avatar)) {
    user.avatar = await updateAvatarToCloudinary(req.files.avatar, user.avatar?.id);
    await user.save();
  }

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { profile: formatUserProfile(user) },
        "Profile has been updated successfully"
      )
    );
});

export { generateAuthLink, verifyAuthToken, ProfileInfo, logout, updateProfile };

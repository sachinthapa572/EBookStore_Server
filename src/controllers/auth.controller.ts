import crypto from "crypto";
import UserModel, { userDoc } from "@/model/auth/user.model";
import VerificationTokenModel from "@/model/auth/verificationToken.model";
import ApiResponse from "@/utils/ApiResponse";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { RequestHandler } from "express";
import { appEnv } from "@/config/env";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";
import { cookiesOptions, HttpStatusCode } from "@/constant";
import { EmailTemplate, mailService } from "@/services/email.service";
import { ObjectId } from "mongoose";
import { formatUserProfile } from "@/utils/helper";
import { updateAvatarToCloudinary } from "@/utils/fileUpload";
import redis from "@/config/redisClient";

// Optimize the generateAuthLink function
export const generateAuthLink: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Use findOneAndUpdate to create or update the user
  const user = await UserModel.findOneAndUpdate(
    { email },
    { email },
    { upsert: true, new: true }
  );

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

    res.status(200).json(
      new ApiResponse(
        200,
        {
          email: User.email,
          link: `http://localhost:3000/api/v1/auth/verify?userId=${verificationToken.token}`,
        },
        "Verification link sent to your email , Please verify your email"
      )
    );
  // res.status(200).json(
  //   new ApiResponse(
  //     200,
  //     {
  //       email: user.email,
  //       link: `${appEnv.SERVER_URL}/verify?userId=${verificationToken.token}`,
  //     },
  //     "Verification link sent to your email, Please verify your email"
  //   )
  // );
});

// Optimize the verifyAuthToken function
export const verifyAuthToken: RequestHandler = asyncHandler(async (req, res) => {
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
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(new ApiResponse(HttpStatusCode.OK, { profile: formatUserProfile(user) }));
  // Redirect to the success URL
  // res.redirect(`${env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(formatUserProfile(user))}`);
});

// Optimize the ProfileInfo function
export const ProfileInfo: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(HttpStatusCode.OK, { profile: req.user }));
});

// Optimize the logout function
export const logout: RequestHandler = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken").clearCookie("refreshToken").send();
});

// Optimize the updateProfile function
export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
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

  res.json(
    new ApiResponse(200, { profile: formatUserProfile(user) }, "Profile updated successfully")
  );
});

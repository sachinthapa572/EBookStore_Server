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

// handel both signup and login
export const generateAuthLink: RequestHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // find the user by email
  let User = await UserModel.findOne({ email });

  // if the user is not found then create a account for the user
  if (!User) {
    User = await UserModel.create({ email });
  }

  // remove the token
  await VerificationTokenModel.findOneAndDelete({ user: User._id });

  // token generation and assign to the user
  const randomToken: string = crypto.randomBytes(36).toString("hex");
  const verificationToken = await VerificationTokenModel.create({
    user: User._id,
    token: randomToken,
  });

  if (!verificationToken) {
    throw new ApiError(500, "Token generation failed");
  }

  // Send verification email
  const emailTemplate = EmailTemplate.VerificationTemplate(
    `${appEnv.SERVER_URL}/verify?userId=${verificationToken.token}`
  );
  try {
    await mailService.sendVerificatinMail({ email, res, emailTemplate });
  } catch (error) {
    throw new ApiError(500, "Failed to send verification email");
  }

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
});

// verify the user
// *yek choti herew milau ne hai yes ma redierct garne kura gare cha so check it
export const verifyAuthToken: RequestHandler = asyncHandler(async (req, res) => {
  let { userId } = req.query as { userId: string };
  if (!userId) {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid request: userId missing.");
  }

  // Validate userId parameter
  if (typeof userId !== "string") {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid request: userId must be a string.");
  }

  // Retrieve verification token and associated user
  const verificationToken = await VerificationTokenModel.findOne({
    token: userId,
  }).populate<{ user: userDoc }>("user");

  // Check for token existence and valid associated user
  if (!verificationToken || !verificationToken.user) {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid or expired verification token.");
  }

  const user = verificationToken.user;

  // Check if the user exists in the database
  const userExists = await UserModel.exists({ _id: user._id });
  if (!userExists) {
    throw new ApiError(HttpStatusCode.NotFound, "User not found.");
  }

  const isTokenValid = verificationToken.compareToken(userId);
  if (!isTokenValid) {
    throw new ApiError(HttpStatusCode.BadRequest, "Invalid request: Token mismatch.");
  }

  // Mark the user as verified and save the user
  user.isVerified = true;

  // Execute saving user and removing token in parallel
  await Promise.all([
    user.save(),
    VerificationTokenModel.findOneAndDelete({ user: user._id }),
  ]);

  // Generate new access and refresh tokens for the user
  const { refreshToken, accessToken } = await generateAccessTokenAndRefreshToken(
    user._id as ObjectId
  );

  // redis.setex(user._id.toString(), 60 * 60 * 24 * 30, accessToken);

  res
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(new ApiResponse(HttpStatusCode.OK, { profile: formatUserProfile(user) }));

  // Redirect to the success URL
  // res.redirect(`${env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(formatUserProfile(user))}`);
});

// profile info of the user
export const ProfileInfo: RequestHandler = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(HttpStatusCode.OK, { profile: req.user }));
});

// logout the user
export const logout: RequestHandler = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken").clearCookie("refreshToken").send();
});

export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: { ...req.body, signedUp: true },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(HttpStatusCode.NotFound, "User not found.");
  }

  if (req.files && req.files.avatar && !Array.isArray(req.files.avatar)) {
    const file = req.files.avatar;
    // if you are using cloudinary this is the method you should use
    user.avatar = await updateAvatarToCloudinary(file, user.avatar?.id);

    await user.save();
  }

  res.json(
    new ApiResponse(200, { profile: formatUserProfile(user) }, "Profile updated successfully")
  );
});

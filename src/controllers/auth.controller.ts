import crypto from "crypto";
import UserModel, { IUser } from "@/model/auth/user.model";
import VerificationTokenModel from "@/model/auth/verificationToken.model";

import ApiResponse from "@/utils/ApiResponse";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";

import { RequestHandler } from "express";
import { env } from "@/config/env";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";
import { cookiesOptions, HttpStatusCode } from "@/constant";
import { EmailTemplate, mailService } from "@/services/email.service";
import { ObjectId } from "mongoose";
import { formatUserProfile } from "@/utils/helper";

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
  const verificationUrl = `${env.SERVER_URL}/verify?userId=${verificationToken.token}`;
  const emailTemplate = EmailTemplate.VerificationTemplate(verificationUrl);
  await mailService.sendVerificatinMail({ email, res, emailTemplate });

  res.status(200).json(
    new ApiResponse(
      201,
      {
        email: User.email,
        token: verificationToken.token,
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
  }).populate<{ user: IUser }>("user");

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

  res
    .status(HttpStatusCode.OK)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { accessToken: accessToken, refreshToken: refreshToken },
        "User verified successfully."
      )
    );
});


// profile info of the user
export const ProfileInfo: RequestHandler = asyncHandler(async (req, res) => {
  const _id = req.user._id;

  if (!_id) {
    throw new ApiError(HttpStatusCode.Unauthorized, "Unauthorized request.");
  }
  const user = await UserModel.findById(_id).select("-refreshToken");
  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, { user }, "User profile information."));
});


// logout the user
export const logout: RequestHandler = asyncHandler(async (_req, res) => {
  res
    .status(HttpStatusCode.OK)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse<null>(HttpStatusCode.OK, null, "User logged out successfully."));
});



export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  const userInfo = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: { ...req.body, signedUp: true },
    },
    {
      new: true,
    }
  );

  if (!userInfo) {
    throw new ApiError(HttpStatusCode.NotFound, "User not found.");
  }

  // if there is any file then upload the file and then upade the info into the databse

  res
    .status(200)
    .json(
      new ApiResponse(200, formatUserProfile(userInfo), "User profile updated successfully")
    );
});

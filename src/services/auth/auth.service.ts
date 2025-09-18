import crypto from "node:crypto";
import type { ObjectId } from "mongoose";
import type { File } from "formidable";
import type { Response } from "express";

import { ApiError } from "@/utils/ApiError";
import { generateAccessTokenAndRefreshToken } from "@/utils/authTokenGenerator";
import { uploadImageTolocalDir } from "@/utils/fileUpload";
import { formatUserProfile } from "@/utils/helper";

import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import { VerificationTokenModel } from "@/model/authentication/verificationToken.model";
import { UserModel, type userDoc } from "@/model/user/user.model";
import { EmailTemplate, mailService } from "@/services/email.service";
import type { SendMailOptionsI } from "@/types";
import type { AuthLinkResponse, TokenPair } from "./auth.type";

class AuthService {
  // Generate authentication link and send verification email
  async generateAuthLink(email: string, res: Response): Promise<AuthLinkResponse> {
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
      throw new ApiError(HttpStatusCode.InternalServerError, "Token generation failed");
    }

    // Send the verification email in development mode
    if (appEnv.NODE_ENV === "development") {
      const emailTemplate = EmailTemplate.VerificationTemplate(
        `${appEnv.SERVER_URL}/auth/verify?userId=${verificationToken.token}`
      );
      const mailOptions: SendMailOptionsI = {
        email,
        emailTemplate,
        res,
      };
      await mailService.sendVerificatinMail(mailOptions);
    }

    return {
      email: user.email,
      link: `${appEnv.SERVER_URL}/auth/verify?userId=${verificationToken.token}`,
    };
  }

  // Verify authentication token and complete user verification
  async verifyAuthToken(userId: string): Promise<{ user: userDoc; tokens: TokenPair }> {
    // Retrieve the verification token and associated user
    const verificationToken = await VerificationTokenModel.findOne({
      token: userId,
    }).populate<{
      user: userDoc;
    }>("user");

    if (!verificationToken?.user) {
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
    const tokens = await generateAccessTokenAndRefreshToken(user._id as unknown as ObjectId);

    return { user, tokens };
  }

  // Update user profile
  async updateProfile(
    userId: ObjectId,
    updateData: Record<string, unknown>,
    avatarFile?: File | null
  ): Promise<userDoc> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { ...updateData, signedUp: true } },
      { new: true }
    );

    if (!user) {
      throw new ApiError(HttpStatusCode.NotFound, "User not found.");
    }

    if (avatarFile !== null && avatarFile !== undefined) {
      const uniqueFilename = `${user._id}-${Date.now()}`;
      user.avatar = await uploadImageTolocalDir(
        avatarFile,
        uniqueFilename,
        avatarFile.originalFilename?.split(".")[1] || "jpg"
      );
      await user.save();
    }

    return user;
  }

  // Format user profile for response
  formatUserForResponse(user: userDoc) {
    return formatUserProfile(user);
  }
}

export const authService = new AuthService();
import type { ObjectId } from "mongoose";

import { ApiError } from "./ApiError";
import { HttpStatusCode } from "@/constant";
import { UserModel } from "@/model/user/user.model";

type GTR = (userId: ObjectId) => Promise<{
  refreshToken: string;
  accessToken: string;
}>;

const generateAccessTokenAndRefreshToken: GTR = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(HttpStatusCode.NotFound, "No user found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      refreshToken,
      accessToken,
    };
  } catch (_error) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      "Error occurred while generating token"
    );
  }
};

export { generateAccessTokenAndRefreshToken };

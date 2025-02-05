import { UserModel } from "@/model";
import { ApiError } from "./";
import { ObjectId } from "mongoose";

type GTR = (userId: ObjectId) => Promise<{
  refreshToken: string;
  accessToken: string;
}>;

const generateAccessTokenAndRefreshToken: GTR = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
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
  } catch (error) {
    throw new ApiError(500, "Error occurred while generating token");
  }
};

export { generateAccessTokenAndRefreshToken };

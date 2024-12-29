import { userDoc } from "@/model/auth/user.model";
import { Request } from "express";

export const formatUserProfile = (user: userDoc): Request["user"] => {
  return {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    username: user.username,
    signedUp: user.signedUp,
  };
};

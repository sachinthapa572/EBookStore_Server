import { userDoc } from "@/model/user/user.model";
import { Request } from "express";

export const formatUserProfile = (user: userDoc): Request["user"] => {
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    avatar: user.avatar?.url,
    username: user.username,
    signedUp: user.signedUp,
    authorId: user.authorId,
  };
};

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

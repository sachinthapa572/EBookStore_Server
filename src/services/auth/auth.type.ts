import type { ObjectId } from "mongoose";

import type { userDoc } from "@/model/user/user.model";

export type AuthUser = {
  _id: ObjectId;
  email: string;
  isVerified: boolean;
};

export type VerificationTokenData = {
  user: userDoc;
  token: string;
  compareToken: (token: string) => boolean;
};

export type AuthLinkResponse = {
  email: string;
  link: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type UserProfile = {
  id: string;
  name?: string;
  email: string;
  avatar?: {
    id: string;
    url: string;
  };
  role: string;
  signedUp: boolean;
  isVerified: boolean;
  authorId?: ObjectId;
};

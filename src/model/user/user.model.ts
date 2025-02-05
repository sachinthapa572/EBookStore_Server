import { appEnv } from "@/config/env";
import { Model, model, ObjectId, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { ROLES, RoleType } from "@/enum/role.enum";

export interface userDoc {
  _id: ObjectId;
  username?: string;
  email: string;
  role: RoleType;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  refreshToken?: string;
  signedUp: boolean;
  avatar?: {
    url: string;
    id: string;
  };
  save: () => Promise<userDoc>;
  authorId?: ObjectId;
  books: ObjectId[];
}

interface Methods {
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

const userSchema = new Schema<userDoc, {}, Methods>(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.USER, ROLES.AUTHOR],
      default: ROLES.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    signedUp: {
      type: Boolean,
      default: false,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "Author",
    },
    avatar: {
      type: Object,
      url: {
        type: String,
        default: "",
      },
      id: {
        type: String,
        default: "",
      },
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// tokens
userSchema.methods.generateAccessToken = function () {
  // @ts-ignore
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    appEnv.ACCESS_TOKEN_SECRET,
    {
      expiresIn: appEnv.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  // @ts-ignore
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    appEnv.REFRESH_TOKEN_SECRET,
    {
      expiresIn: appEnv.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const UserModel = model<userDoc>("User", userSchema) as Model<userDoc, {}, Methods>;

import { env } from "@/config/env";
import { Model, model, ObjectId, Schema } from "mongoose";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  _id: ObjectId;
  username?: string;
  email: string;
  role: "user" | "author";
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  refreshToken?: string;
  signedUp: boolean;
  avatar?: {
    url: string;
    id: string;
  };
  save: () => Promise<IUser>;
  authorId?: ObjectId;
}

interface Methods {
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

const userSchema = new Schema<IUser, {}, Methods>(
  {
    username: {
      type: String,
      // required: true,
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
      enum: ["user", "author"],
      default: "user",
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
  },
  {
    timestamps: true,
  }
);

// tokens
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const UserModel = model("User", userSchema);

export default UserModel as Model<IUser, {}, Methods>;

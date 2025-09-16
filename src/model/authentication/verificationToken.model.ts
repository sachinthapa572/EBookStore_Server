import bcrypt from "bcryptjs";
import { type Document, type Model, model, Schema } from "mongoose";

interface IVerificationToken extends Document {
  user: Schema.Types.ObjectId;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

type IHashToken = {
  compareToken: (token: string) => boolean;
};

const verificationTokenSchema = new Schema<
  IVerificationToken,
  Record<string, unknown>,
  IHashToken
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24,
    },
  },
  {
    timestamps: true,
  }
);
verificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
  }
  next();
});

verificationTokenSchema.methods.compareToken = function (token) {
  return token === this.token;
};

export const VerificationTokenModel = model<IVerificationToken>(
  "VerificationToken",
  verificationTokenSchema
) as Model<IVerificationToken, Record<string, unknown>, IHashToken>;

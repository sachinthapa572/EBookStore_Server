import { Document, Model, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IVerificationToken extends Document {
  user: Schema.Types.ObjectId;
  token: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IHashToken {
  compareToken: (token: string) => boolean;
}

const verificationTokenSchema = new Schema<IVerificationToken, {}, IHashToken>(
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

const VerificationTokenModel = model("VerificationToken", verificationTokenSchema);

export default VerificationTokenModel as Model<IVerificationToken, {}, IHashToken>;

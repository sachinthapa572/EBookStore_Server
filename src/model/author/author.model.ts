import { type Model, model, type ObjectId, Schema } from "mongoose";

export type AuthorDoc = {
  userId: ObjectId;
  name: string;
  about: string;
  slug: string;
  socialLinks: string[];
  books: ObjectId[];
};

const authorSchema = new Schema<AuthorDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      tolowercase: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    about: {
      type: String,
      required: true,
      trim: true,
    },
    socialLinks: [String],
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
export const AuthorModel = model<AuthorDoc>("Author", authorSchema) as Model<AuthorDoc>;

import { type Model, model, type ObjectId, Schema } from "mongoose";

export type ReviewDoc = {
  user: ObjectId;
  book: ObjectId;
  rating: number;
  content?: string;
  avgRating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
};

const reviewSchema = new Schema<ReviewDoc>(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.ObjectId,
      ref: "Book",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ReviewModel = model<ReviewDoc>("Review", reviewSchema) as Model<ReviewDoc>;

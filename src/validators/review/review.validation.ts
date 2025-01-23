import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const newReviewSchema = z.object({
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Invalid Rating Types",
    })
    .nonnegative("Rating must be a non-negative number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  content: z
    .string({
      invalid_type_error: "Invalid Content Types",
    })
    .optional(),
  bookId: z
    .string({
      required_error: "BookId is required",
      invalid_type_error: "Invalid BookId Types",
    })
    .transform((arg, ctx) => {
      if (!isValidObjectId(arg)) {
        ctx.addIssue({ code: "custom", message: "Invalid BookId Types" });
        return z.NEVER;
      }
      return arg;
    }),
});

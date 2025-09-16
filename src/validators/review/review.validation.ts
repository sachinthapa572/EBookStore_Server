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
});

export const paginationSchema = z.object({
  page: z
    .string({
      invalid_type_error: "Invalid Page Types",
    })
    .optional(),
  limit: z
    .string({
      invalid_type_error: "Invalid Limit Types",
    })
    .optional(),
});

export type NewReviewType = z.infer<typeof newReviewSchema>;
export type PaginationType = z.infer<typeof paginationSchema>;

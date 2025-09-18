import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const historyValidationSchema = z.object({
  bookId: z
    .string({
      required_error: "Book id is missing!",
      invalid_type_error: "Invalid book id!",
    })
    .transform((arg, ctx) => {
      if (!isValidObjectId(arg)) {
        ctx.addIssue({ code: "custom", message: "Invalid book id!" });
        return z.NEVER;
      }

      return arg;
    }),
  lastLocation: z
    .string({
      invalid_type_error: "Invalid last location!",
    })
    .trim()
    .optional(),
  highlights: z
    .array(
      z.object({
        selection: z
          .string({
            required_error: "Highlight selection is missing",
            invalid_type_error: "Invalid Highlight selection!",
          })
          .trim(),
        fill: z
          .string({
            required_error: "Highlight fill is missing",
            invalid_type_error: "Invalid Highlight fill!",
          })
          .trim(),
      })
    )
    .optional(),

  // TODO this is the remove flag for the highlight not the note fix it later
  remove: z.boolean({
    required_error: "Remove is missing!",
    invalid_type_error: "Remove must be a boolean value!",
  }),

  notes: z
    .object({
      content: z.string().trim(),
      remove: z.boolean().optional(),
    })
    .optional(),
});

export type NewHistoryType = z.infer<typeof historyValidationSchema>;

import { z } from "zod";

const commonBookSchema = {
  title: z
    .string({
      required_error: "Please provide a title for the book.",
      invalid_type_error: "The title must be a text value.",
    })
    .trim(),
  status: z.enum(["published", "unpublished"], {
    required_error: "Please select at least one status.",
    message: "Please select at least one status.",
  }),
  description: z
    .string({
      required_error: "Please provide a description for the book.",
      invalid_type_error: "The description must be a text value.",
    })
    .trim(),
  language: z
    .string({
      required_error: "Please specify the language of the book.",
      invalid_type_error: "The language must be a text value.",
    })
    .trim(),
  publishedAt: z.coerce
    .date()
    .refine(
      (date) => date <= new Date(),
      "The publish date cannot be in the future. Please provide a valid date."
    ),
  publicationName: z
    .string({
      required_error: "Please provide the name of the publication.",
      invalid_type_error: "The publication name must be a text value.",
    })
    .trim(),
  genre: z
    .string({
      required_error: "Please specify the genre of the book.",
      invalid_type_error: "The genre must be a text value.",
    })
    .trim(),
  price: z
    .string({
      required_error: "Please provide the price details as a JSON string.",
      invalid_type_error: "The price must be a valid JSON string.",
    })
    .transform((value, ctx) => {
      try {
        return JSON.parse(value);
      } catch (_error) {
        ctx.addIssue({
          code: "custom",
          message: "The price data is invalid. Please provide it as a valid JSON string.",
        });
        return z.NEVER;
      }
    })
    .pipe(
      z.object({
        mrp: z
          .number({
            required_error: "Please specify the MRP of the book.",
            invalid_type_error: "The MRP must be a numeric value.",
          })
          .nonnegative("The MRP must be a non-negative value."),
        sale: z
          .number({
            required_error: "Please specify the sale price of the book.",
            invalid_type_error: "The sale price must be a numeric value.",
          })
          .nonnegative("The sale price must be a non-negative value."),
      })
    )
    .refine(
      (price) => price.sale <= price.mrp,
      "The sale price must be less than or equal to the MRP. Please provide valid pricing."
    ),
};

const fileInfo = z
  .string({
    required_error: "File information is required. Please provide it as a JSON string.",
    invalid_type_error: "File information must be a valid JSON string.",
  })
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch (_error) {
      ctx.addIssue({
        code: "custom",
        message:
          "The file information provided is invalid. Ensure it is a well-formed JSON string.",
      });
      return z.NEVER;
    }
  })
  .pipe(
    z.object({
      name: z
        .string({
          required_error: "File name is required. Please specify the name of the file.",
          invalid_type_error: "The file name must be a text value.",
        })
        .trim(),
      type: z
        .string({
          required_error:
            "File type is required. Please specify the type of the file (e.g., 'image/png').",
          invalid_type_error: "The file type must be a text value.",
        })
        .trim(),
      size: z
        .number({
          required_error:
            "File size is required. Please specify the size of the file in bytes.",
          invalid_type_error: "The file size must be a numeric value.",
        })
        .nonnegative("The file size must be a non-negative number."),
    })
  );

export const newBookSchema = z.object({
  ...commonBookSchema,
  fileInfo,
});

export const updateBookSchema = z.object({
  ...commonBookSchema,
  slug: z.string({
    message: "Invalid slug!",
  }),
  fileInfo: fileInfo.optional(),
});

// coresce.date will try to convert the value to date if it is not a date it will throw an error
// front end bata send garda as the string send huncha as we know it the formdata
// but hamlai as the data ko rup ma chaiye cha so it convert the data into the data
// after writing the corece.{dataType} it will try to convert the data into the data type at the compile time

// pipe is used to apply multiple validation on the same field

export const searchBooksSchema = z.object({
  title: z
    .string({
      required_error: "Search title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(3, "Search query must be at least 3 characters long")
    .trim(),
  pageSize: z
    .string({
      invalid_type_error: "Page size must be a string",
    })
    .optional()
    .transform((val) => {
      if (!val) {
        return "10";
      }
      const num = Number.parseInt(val, 10);
      return Number.isNaN(num) ? "10" : Math.max(1, Math.min(100, num)).toString();
    }),
  pageNumber: z
    .string({
      invalid_type_error: "Page number must be a string",
    })
    .optional()
    .transform((val) => {
      if (!val) {
        return "1";
      }
      const num = Number.parseInt(val, 10);
      return Number.isNaN(num) ? "1" : Math.max(1, num).toString();
    }),
});

export type NewBookType = z.infer<typeof newBookSchema>;
export type UpdateBookType = z.infer<typeof updateBookSchema>;
export type SearchBooksType = z.infer<typeof searchBooksSchema>;

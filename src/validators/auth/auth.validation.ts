import { z } from "zod";

export const emailschema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Invalid Email Types",
    })
    .email("Invalid email address"),
});

export const useridsechema = z.object({
  userId: z.string({
    required_error: "userId is required",
    invalid_type_error: "Invalid userId Types",
  }),
});

export const newUserSchema = z.object({
  username: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Invalid Name Types",
    })
    .min(3, "Name must be at least 3 characters long")
    .trim(),
});

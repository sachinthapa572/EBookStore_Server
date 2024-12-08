import { z } from "zod";

export const emailschema = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Invalid Email Types",
    })
    .email("Invalid email address"),
};

export const useridsechema = {
  userId: z.string({
    required_error: "userId is required",
    invalid_type_error: "Invalid userId Types",
  }),
};

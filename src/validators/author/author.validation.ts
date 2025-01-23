import { z } from "zod";

export const newAuthorSchema = z.object({
  name: z
    .string({
      required_error: "Name is missing!",
      invalid_type_error: "Invalid name!",
    })
    .trim()
    .min(3, "Invalid name"),
  about: z
    .string({
      required_error: "About is missing!",
      invalid_type_error: "Invalid about!",
    })
    .trim()
    .min(10, "Please write at least 10 characters about yourself!"),
  socialLinks: z
    .array(z.string().url("Social links can only be list of  valid URLs!"))
    .optional(),
});

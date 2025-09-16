import { z } from "zod";

// Define regex patterns at top level for performance
const CAMEL_CASE_REGEX = /([a-z])([A-Z])/g;
const FIRST_CHAR_REGEX = /^./;

const formatTitle = (text: string) => {
  return text
    .replace(CAMEL_CASE_REGEX, "$1 $2") // Add space between camelCase words
    .replace(FIRST_CHAR_REGEX, (str) => str.toUpperCase()); // Capitalize the first letter
};

export const rString = (name: string, min = 1, max = 100) => {
  const formattedName = formatTitle(name);

  return z
    .string({
      required_error: `${formattedName} is required`,
      invalid_type_error: `Invalid ${formattedName} type`,
    })
    .trim()
    .nonempty({
      message: `${formattedName} cannot be empty`,
    })
    .min(min, `${formattedName} must be at least ${min} character${min > 1 ? "s" : ""} long`)
    .max(max, `${formattedName} must be at most ${max} character${max > 1 ? "s" : ""} long`);
};
export const uuidSchema = (name: string) => {
  return rString(name).uuid({
    message: "Invalid UUID",
  });
};
export const uuidGSchema = <T extends string[]>(...inputNames: T) => {
  const names = inputNames.length === 0 ? (["id"] as T) : inputNames;
  const schema: Record<T[number], z.ZodString> = {} as Record<T[number], z.ZodString>;
  for (const name of names) {
    schema[name as T[number]] = uuidSchema(name);
  }

  return z.object(schema);
};

export type UuidGType<T extends string[] = ["id"]> = z.infer<
  ReturnType<typeof uuidGSchema<T>>
>;

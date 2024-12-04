import "dotenv/config";
import { z } from "zod";

// Define schema using zod
const envSchema = z.object({
  // Application settings
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),
  MONGODB_URI: z.string({
    required_error: "MONGODB_URI is required",
  }),
  SERVER_URL: z.string({
    required_error: "SERVER_URL is required",
  }),
  VERIFICATION_EMAIL: z
    .string({
      required_error: "VERIFICATION_EMAIL is required",
    })
    .email("Invalid email address"),

  // Authentication settings
  ACCESS_TOKEN_SECRET: z.string({
    required_error: "ACCESS_TOKEN_SECRET is required",
  }),
  ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
  REFRESH_TOKEN_SECRET: z.string({
    required_error: "REFRESH_TOKEN is required",
  }),
  REFRESH_TOKEN_EXPIRY: z.string().default("10d"),

  // CORS settings
  CORS_ORIGIN: z.string().optional(),

  // Mailtrap settings
  MAILTRAP_SMTP_HOST: z.string({
    required_error: "MAILTRAP_SMTP_HOST is required",
  }),
  MAILTRAP_SMTP_PORT: z.string().transform(Number).default("2525"),
  MAILTRAP_SMTP_USER: z.string({
    required_error: "MAILTRAP_SMTP_USER is required",
  }),
  MAILTRAP_SMTP_PASS: z.string({
    required_error: "MAILTRAP_SMTP_PASS is required",
  }),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

//! later change this to global error handler
if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Define schema using zod
const envSchema = z.object({
  // Application settings
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Authentication settings
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("1d"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRY: z.string().default("10d"),

  // CORS settings
  CORS_ORIGIN: z.string().optional(),

  // Mailtrap settings
  // MAILTRAP_SMTP_HOST: z.string().min(1, "MAILTRAP_SMTP_HOST is required"),
  // MAILTRAP_SMTP_PORT: z.string().transform(Number),
  // MAILTRAP_SMTP_USER: z.string().min(1, "MAILTRAP_SMTP_USER is required"),
  // MAILTRAP_SMTP_PASS: z.string().min(1, "MAILTRAP_SMTP_PASS is required"),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

//! later change this to global error handler
if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = { ...parsedEnv.data, DB_NAME: "BookStore" };

// Optional: Log loaded environment variables (safe values only)
console.log("Environment variables loaded:", {
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  MONGODB_URI: "[REDACTED]",
  CORS_ORIGIN: env.CORS_ORIGIN,
});

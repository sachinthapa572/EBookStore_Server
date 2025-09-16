import env from "dotenv";
import { z } from "zod";

env.config();

// Define schema using zod
const envSchema = z.object({
  // Application settings
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3000"),
  MONGODB_URI: z.string({
    required_error: "MONGODB_URI is required",
  }),
  SERVER_URL: z.string({
    required_error: "SERVER_URL is required",
  }),
  AUTH_SUCCESS_URL: z.string({
    required_error: "AUTH_SUCCESS_URL is required",
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

  // Cloudinary settings
  CLOUDINARY_NAME: z.string({
    required_error: "CLOUD_NAME is required",
  }),
  CLOUDINARY_API_KEY: z.string({
    required_error: "CLOUD_API_KEY is required",
  }),
  CLOUDINARY_API_SECRET: z.string({
    required_error: "CLOUD_API_SECRET is required",
  }),

  // File storage settings
  // UPLOADTHING_API_KEY: z.string({
  //     required_error: "UPLOADTHING_API_KEY is required",
  // }),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

//! later change this to global error handler
if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());

  throw new Error("Invalid environment variables");
}

export const appEnv = parsedEnv.data;

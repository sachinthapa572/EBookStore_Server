import type { CorsOptions } from "cors";
import { type CsrfRequestMethod, type DoubleCsrfConfigOptions, doubleCsrf } from "csrf-csrf";
import type { Request } from "express";

import { appEnv } from "./config/env";
import path from "node:path";

export const DB_NAME: string = "E_Book_Store";
export const HttpStatusCode = {
  Created: 201,
  OK: 200,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
  SERVICEUNAVAILABLE: 503,
  TOO_MANY_REQUESTS: 429,
  UnprocessableEntity: 423,
  CONFLICT: 409,
  Unauthenticated: 422,
} as const;

export type HttpStatusCode = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
export const statusMessages: Record<HttpStatusCode, string> = {
  [HttpStatusCode.OK]: "OK",
  [HttpStatusCode.BadRequest]: "Bad Request",
  [HttpStatusCode.Unauthorized]: "Unauthorized",
  [HttpStatusCode.Forbidden]: "Forbidden",
  [HttpStatusCode.NotFound]: "Not Found",
  [HttpStatusCode.InternalServerError]: "Internal Server Error",
  [HttpStatusCode.SERVICEUNAVAILABLE]: "Service Unavailable",
  [HttpStatusCode.TOO_MANY_REQUESTS]: "Too Many Requests",
  [HttpStatusCode.Created]: "Created",
  [HttpStatusCode.UnprocessableEntity]: "Unprocessable Entity",
  [HttpStatusCode.CONFLICT]: "Conflict",
  [HttpStatusCode.Unauthenticated]: "Unauthenticated",
};

export const cookiesOptions = {
  httpOnly: true,
  secure: true,
} as const;

export const bookstoragePath = path.resolve(__dirname, "../public/books");
export const photoStoragePath = path.resolve(__dirname, "../public/photos");

export const corsOptions: CorsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  origin: "http://localhost:5173",
  credentials: true,
};

const CSRF_SECRETS = "This is a secret key";
export const csrfOptions: DoubleCsrfConfigOptions = {
  getSecret: () => CSRF_SECRETS,
  getSessionIdentifier: (req: Request) =>
    req.ip || String(req.headers["x-forwarded-for"] ?? ""),
  cookieName: "_Host-CSRF",
  cookieOptions: {
    sameSite: "lax" as "lax" | "strict" | "none",
    path: "/",
    secure: false,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"] as CsrfRequestMethod[],
  getCsrfTokenFromRequest: (req: Request) => req.body.csrf || req.headers["x-csrf-token"],
  errorConfig: {
    message: "Invalid CSRF token",
    statusCode: HttpStatusCode.Forbidden,
    code: "invalid_csrf_token",
  },
};

if (process.env.NODE_ENV === "production" && csrfOptions.cookieOptions) {
  csrfOptions.cookieOptions.secure = true;
}

export const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf(csrfOptions);
export const DB_URL = `${appEnv.MONGODB_URI}/${DB_NAME}`;

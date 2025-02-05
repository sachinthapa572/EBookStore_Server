import path from "path";
import { appEnv } from "./config/env";
import ApiError from "./utils/ApiError";
import { v4 as uuidv4 } from "uuid";
import rateLimit from "express-rate-limit";

export const DB_NAME: string = "E-BookStore";

// Api error class HttpStatusCode enum

export enum HttpStatusCode {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  SERVICEUNAVAILABLE = 503,
  TOO_MANY_REQUESTS = 429,
}

export const statusMessages: { [key in HttpStatusCode]: string } = {
  [HttpStatusCode.OK]: "OK",
  [HttpStatusCode.BadRequest]: "Bad Request",
  [HttpStatusCode.Unauthorized]: "Unauthorized",
  [HttpStatusCode.Forbidden]: "Forbidden",
  [HttpStatusCode.NotFound]: "Not Found",
  [HttpStatusCode.InternalServerError]: "Internal Server Error",
  [HttpStatusCode.SERVICEUNAVAILABLE]: "Service Unavailable",
  [HttpStatusCode.TOO_MANY_REQUESTS]: "Too Many Requests",

};

export const cookiesOptions = {
  httpOnly: true,
  secure: true,
};

export const bookstoragePath = path.resolve(__dirname, "../public/books");
export const photoStoragePath = path.resolve(__dirname, "../public/photos");

export const corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  origin: appEnv.CORS_ORIGIN === "*" ? "*" : process.env.CORS_ORIGIN?.split(","),
  credentials: true,
};

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, _res) => {
    return req.clientIp || uuidv4(); // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

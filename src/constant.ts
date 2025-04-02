import rateLimit from "express-rate-limit";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { CorsOptions } from "cors";
import { doubleCsrf, DoubleCsrfConfigOptions, RequestMethod } from "csrf-csrf";
import { Request } from "express";
import { appEnv } from "./config/env";
import { ApiError } from "./utils";

export const DB_NAME: string = "E-BookStore";

// Api error class HttpStatusCode enum

export enum HttpStatusCode {
    Created = 201,
    OK = 200,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    SERVICEUNAVAILABLE = 503,
    TOO_MANY_REQUESTS = 429,
    UnprocessableEntity = 423,
    CONFLICT = 409,
}
// { [key in HttpStatusCode]: string }
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
};

export const cookiesOptions = {
    httpOnly: true,
    secure: true,
} as const;

export const bookstoragePath = path.resolve(__dirname, "../public/books");
export const photoStoragePath = path.resolve(__dirname, "../public/photos");

export const corsOptions: CorsOptions = {
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
            `There are too many requests. You are only allowed ${options.limit
            } requests per ${options.windowMs / 60000} minutes`
        );
    },
});


const CSRF_SECRETS = "This is a secret key";
export const csrfOptions: DoubleCsrfConfigOptions = {
    getSecret: () => CSRF_SECRETS, // A function that optionally takes the request and returns a secret
    cookieName: "_Host-CSRF", // __Host-CSRF The name of the cookie to be used, recommend using Host prefix.
    cookieOptions: {
        sameSite: "lax" as "lax" | "strict" | "none", // Recommend you make this strict if posible
        path: "/",
        secure: false,
    },
    size: 64, // The size of the CSRF token in bits
    ignoredMethods: ["GET", "HEAD", "OPTIONS"] as RequestMethod[], // A list of request methods that will not be protected.
    getTokenFromRequest: (req: Request) => req.body.csrf || req.headers["x-csrf-token"], // A function that returns the token from the request
    errorConfig: {
        message: "Invalid CSRF token",
        statusCode: HttpStatusCode.Forbidden,
        code: "invalid_csrf_token",

    }

};



if (process.env.NODE_ENV === "production" && csrfOptions.cookieOptions) {
    csrfOptions.cookieOptions.secure = true;
}

export const {
    generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(csrfOptions);
import type { ErrorRequestHandler, RequestHandler } from "express";

import { ApiError } from "@/utils/ApiError";

import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";

// Define a proper type for MongoDB errors
type MongoError = {
  name: string;
  code: number;
  keyPattern: Record<string, unknown>;
  keyValue: Record<string, unknown>;
  message: string;
};

// Union type for all possible error types
type ErrorType = ApiError | MongoError | Error;

const globalErrHandler: ErrorRequestHandler = (error: ErrorType, _req, res, _) => {
  let err: ApiError;

  console.log("----Error---", error);

  // handle the mongoose error
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "MongoServerError"
  ) {
    const mongoError = error as MongoError;
    if (mongoError.code === 11_000) {
      const field = Object.keys(mongoError.keyPattern)[0];
      err = new ApiError(HttpStatusCode.CONFLICT, `${field} already exists`);
    } else {
      err = new ApiError(
        HttpStatusCode.InternalServerError,
        mongoError.message || "Internal Server Error"
      );
    }
  } else if (error instanceof ApiError) {
    err = error;
  } else {
    const genericError = error as Error & { statusCode?: HttpStatusCode };
    err = new ApiError(
      genericError.statusCode || HttpStatusCode.InternalServerError,
      genericError.message || "Internal Server Error"
    );
  }

  const statusCode = Number(err.statusCode || HttpStatusCode.InternalServerError);
  const status = statusCode >= HttpStatusCode.InternalServerError ? "error" : "fail";

  res.status(statusCode).json({
    status,
    message: err.message,
    success: err.success,
    errors: err.errors,
    stack: appEnv.NODE_ENV === "production" ? undefined : err.stack,
    timestamp: new Date().toISOString(),
  });
};

// Not Found route handler
const notFoundErr: RequestHandler = (req) => {
  throw new ApiError(HttpStatusCode.NotFound, "Route not found", [
    `Cannot find ${req.originalUrl}`,
  ]);
};

export { globalErrHandler, notFoundErr };

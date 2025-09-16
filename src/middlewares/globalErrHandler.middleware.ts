import { ErrorRequestHandler, RequestHandler } from "express";

import { appEnv } from "@/config";
import { ApiError } from "@/utils";

// type TError = IApiError & Error;

const globalErrHandler: ErrorRequestHandler = (err: any, _req, res, _) => {
  // handle the monngoes error
  if (err.name === "MongoServerError") {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      // const value = err.keyValue[field];
      err = new ApiError(409, `${field} already exists`);
    } else {
      err = new ApiError(500, err.message || "Internal Server Error");
    }
  }

  if (!(err instanceof ApiError)) {
    err = new ApiError(err.statusCode, err.message || "Internal Server Error");
  }

  const statusCode = err.statusCode || 500;
  const status = statusCode >= 500 ? "error" : "fail";

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
  throw new ApiError(404, "Route not found", [`Cannot find ${req.originalUrl}`]);
};

export { globalErrHandler, notFoundErr };

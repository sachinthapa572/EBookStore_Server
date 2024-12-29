import { appEnv } from "@/config/env";
import ApiError from "@/utils/ApiError";
import { ErrorRequestHandler, RequestHandler } from "express";

const globalErrHandler: ErrorRequestHandler = (err, _req, res, _) => {
  console.log("Invoked the error handeler");
  // If the error is not an instance of ApiError, convert it into one
  if (!(err instanceof ApiError)) {
    err = new ApiError(500, err.message || "Internal Server Error");
  }

  const statusCode = err.statusCode || 500;
  const status = statusCode >= 500 ? "error" : "fail"; // Fail for 4xx, Error for 5xx

  res.status(statusCode).json({
    status,
    message: err.message,
    success: err.success,
    errors: err.errors,
    stack: appEnv.NODE_ENV === "production" ? undefined : err.stack,
  });
};

// Not Found route handler
const notFoundErr: RequestHandler = (req) => {
  throw new ApiError(404, `Not Found - ${req.originalUrl} on the server`);
};

export { globalErrHandler, notFoundErr };

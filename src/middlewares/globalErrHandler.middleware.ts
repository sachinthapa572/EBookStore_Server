import { ErrorRequestHandler, RequestHandler } from "express";

import { appEnv } from "@/config";
import { IApiError } from "@/types";
import { ApiError } from "@/utils";

type TError = IApiError & Error ;

const globalErrHandler: ErrorRequestHandler = (err: TError, _req, res, _) => {


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
    });
};

// Not Found route handler
const notFoundErr: RequestHandler = (req) => {
    throw new ApiError(404, "Route not found", [`Cannot find ${req.originalUrl}`]);
};

export { globalErrHandler, notFoundErr };


import { appEnv } from "@/config/env";
import { HttpStatusCode, statusMessages } from "@/constant";
import { IApiError } from "@/types";

class ApiError extends Error implements IApiError {
    readonly statusCode: HttpStatusCode;
    readonly success: boolean = false;
    readonly errors?: Array<string>;
    readonly status: string;
    readonly message: string;

    constructor(statusCode: HttpStatusCode, message?: string, errors?: Array<string>) {
        const errorMessage = message || statusMessages[statusCode];
        super(errorMessage);

        this.statusCode = statusCode;
        this.errors = errors;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.message = errorMessage;

        // Conditionally capture the stack trace based on the environment (development only)
        if (appEnv.NODE_ENV === "development") {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = undefined;
        }
    }
}

export { ApiError };


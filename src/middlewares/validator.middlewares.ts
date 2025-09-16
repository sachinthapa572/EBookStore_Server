import type { RequestHandler } from "express";
import type { ZodObject, ZodRawShape, ZodType } from "zod";

import { ApiResponse } from "@/utils/ApiResponse";

import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";

export type IValidator = <T extends ZodType | ZodObject<ZodRawShape>>(
  schema: T
) => RequestHandler;

export const validator: IValidator = (schema) => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync(req.body);
      if (result.success) {
        req.body = result.data;
        next();
      } else {
        const errorFlattened = result.error.flatten();
        const error = errorFlattened.fieldErrors;
        res
          .status(HttpStatusCode.BadRequest)
          .json(
            new ApiResponse<typeof error>(HttpStatusCode.BadRequest, error, "Validation Error")
          );
      }
    } catch (error) {
      logger.error("Unexpected error", error);
      next(error);
    }
  };
};

export const queryValidator: IValidator = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      if (result.success) {
        req.query = result.data;
        next();
      } else {
        const error = result.error.flatten().fieldErrors;
        res
          .status(HttpStatusCode.UnprocessableEntity)
          .json(
            new ApiResponse<typeof error>(
              HttpStatusCode.UnprocessableEntity,
              error,
              appEnv.NODE_ENV === "production" ? "Validation Error" : "Query Validation Error"
            )
          );
      }
    } catch (error) {
      next(error);
    }
  };
};

export const paramValidator: IValidator = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.params);
      if (result.success) {
        req.params = result.data;
        next();
      } else {
        const error = result.error.flatten().fieldErrors;
        res
          .status(HttpStatusCode.UnprocessableEntity)
          .json(
            new ApiResponse<typeof error>(
              HttpStatusCode.UnprocessableEntity,
              error,
              appEnv.NODE_ENV === "production" ? "Validation Error" : "Params Validation Error"
            )
          );
      }
    } catch (error) {
      next(error);
    }
  };
};

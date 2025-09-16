import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";

import { ApiError } from "@/utils/ApiError";

import { HttpStatusCode } from "@/constant";

const validateObjectId: RequestHandler = (req, _res, next) => {
  const id: string | undefined = req.params.id || (req.query.id as string) || req.body._id;

  if (id) {
    try {
      req.params.id = new ObjectId(id).toHexString();
    } catch (_error) {
      return next(
        new ApiError(
          HttpStatusCode.UnprocessableEntity,
          "The provided ID is not a valid MongoDB ObjectId format. "
        )
      );
    }
  }

  next();
};

export default validateObjectId;

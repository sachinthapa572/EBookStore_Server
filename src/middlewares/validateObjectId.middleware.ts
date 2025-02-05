import { ObjectId } from "mongodb";
import { RequestHandler } from "express";

import { ApiError } from "../utils";

const validateObjectId: RequestHandler = (req, _res, next): void => {
  const id: string | undefined = req.params.id || (req.query.id as string) || req.body._id;

  if (id) {
    try {
      req.params.id = new ObjectId(id).toHexString();
    } catch (error) {
      return next(
        new ApiError(423, "The provided ID is not a valid MongoDB ObjectId format. ")
      );
    }
  }

  next();
};

export default validateObjectId;

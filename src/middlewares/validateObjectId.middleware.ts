import { ObjectId } from "mongodb";
import ApiError from "../utils/ApiError";
import { RequestHandler } from "express";

const validateObjectId: RequestHandler = (req, _res, next): void => {
  const id: string | undefined = req.params.id || (req.query.id as string) || req.body._id;

  if (id) {
    try {
      req.params.id = new ObjectId(id).toHexString();
    } catch (error) {
      return next(new ApiError(400, "Invalid ID provided"));
    }
  }

  next();
};

export default validateObjectId;

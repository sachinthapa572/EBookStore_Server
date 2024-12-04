import { ObjectId } from "mongodb";
import ApiError from "../utils/ApiError";
import { RequestHandler } from "express";

const validateObjectId: RequestHandler = (req, _res, next): void => {
  const id: string | undefined =
    req.params.id || (req.query.id as string) || req.body._id;

  if (id) {
    // Check if it's a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid ID provided"));
    }

    // Ensure id is converted to ObjectId if valid
    req.params.id = new ObjectId(id).toHexString(); 
  }

  next();
};

export default validateObjectId;

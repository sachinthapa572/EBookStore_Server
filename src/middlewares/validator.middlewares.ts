import ApiResponse from "@/utils/ApiResponse";
import { RequestHandler } from "express";
import { ZodType } from "zod";

export const validater = <T extends unknown>(schema: ZodType<T>): RequestHandler => {
  return async (req, res, next) => {
    try {
      // const schema = z.object(obj);
      const result = schema.safeParse(req.body);

      if (result.success) {
        req.body = result.data;
        next();
      } else {
        const error = result.error.flatten().fieldErrors;
        res.status(422).json(new ApiResponse<typeof error>(422, error, "Validation Error"));
      }
    } catch (error) {
      next(error);
    }
  };
};

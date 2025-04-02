import { HttpStatusCode } from "@/constant";
import { ApiError } from "@/utils";
import { RequestHandler } from "express";
import { ZodObject, ZodRawShape } from "zod";


export const validater = <T extends ZodRawShape>(schema: ZodObject<T>): RequestHandler => {
    return async (req, _res, next) => {
        try {
            // const schema = z.object(obj);
            const result = schema.safeParse(req.body);

            if (result.success) {
                req.body = result.data;
                next();
            } else {
                const errorMessages = result.error.flatten().fieldErrors;
                // res.status(422).json(new ApiResponse<typeof error>(422, error, "Validation Error"));

                const errorArray = Object.values(errorMessages).flat();
                throw new ApiError(HttpStatusCode.BadRequest, "Validation Error", errorArray as string[]);
            }
        } catch (error) {
            next(error);
        }
    };
};

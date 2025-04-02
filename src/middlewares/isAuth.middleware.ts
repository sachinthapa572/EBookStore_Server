import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { appEnv } from "@/config";
import { HttpStatusCode } from "@/constant";
import { UserModel } from "@/model";
import { customReqHandler, newReviewType } from "@/types";
import { ApiError, asyncHandler, formatUserProfile } from "@/utils";


/**
 * Middleware to verify JWT token and authenticate user.
 * It checks for the token in cookies or authorization header,
 * verifies it, and attaches the user information to the request object.
 * If the token is invalid or expired, it returns an error response.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware function
 */

const verifyJWT: RequestHandler = async (req, _res, next) => {
    try {
        const token =
            req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s*/, "").trim();

        if (!token) {
            return next(
                new ApiError(401, "Authentication required. Please provide a valid access token")
            );
        }

        // Verify the token and decode the payload
        const decodedToken = jwt.verify(token, appEnv.ACCESS_TOKEN_SECRET) as Request["user"];

        if (!decodedToken?._id) {
            return next(new ApiError(401, "Authentication failed. Invalid token format"));
        }

        const user = await UserModel.findById(decodedToken._id);

        if (!user) {
            return next(new ApiError(401, "Authentication failed. User no longer exists"));
        }

        req.user = formatUserProfile(user);
        next();
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError") {
                return next(new ApiError(401, "Authentication failed. The token is invalid"));
            }
            if (error.name === "TokenExpiredError") {
                return next(new ApiError(401, "Authentication failed. The token has expired"));
            }
            return next(new ApiError(500, "An unexpected error occurred during authentication"));
        }
        return next(new ApiError(500, "An unexpected error occurred during authentication"));
    }
};

export const isPurchaseByTheUser: customReqHandler<newReviewType> = asyncHandler(
    async (req, _res, next) => {
        const userDoc = await UserModel.findOne({
            _id: req.user._id,
            books: req.body.bookId,
        });

        if (!userDoc) {
            return next(
                new ApiError(HttpStatusCode.Forbidden, "Access denied. This action requires prior purchase of the book")
            );
        }
        next();
    }
);

export { verifyJWT as isAuth };


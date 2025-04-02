import { HttpStatusCode } from "@/constant";
import { newAuthorSchema } from "@/validators/author/author.validation";
import { newBookSchema, updateBookSchema } from "@/validators/book/book.validation";
import { newReviewSchema } from "@/validators/review/review.validation";
import { RequestHandler, Response } from "express";
import { z } from "zod";

export interface SendMailOptionsI {
    email: string;
    emailTemplate: string;
    res: Response;
}

export interface IApiResponse<T> {
    statusCode: number;
    data?: T;
    message: string;
    success: boolean;
}

export interface IApiError {
    statusCode: HttpStatusCode;
    success: boolean;
    message: string;
    errors?: Array<string>;
    status: string;
    stack?: string | undefined;
}

export type PopulatedBook = {
    cover: {
        url: string;
        id: string;
    };
    _id: string;
    author: {
        _id: string;
        name: string;
        slug: string;
    };
    title: string;
    slug: string;
};

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
export type newBookBody = z.infer<typeof newBookSchema>;
export type updateBookType = z.infer<typeof updateBookSchema>;
export type newReviewType = z.infer<typeof newReviewSchema>;

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type customReqHandler<T> = RequestHandler<{}, {}, T>;

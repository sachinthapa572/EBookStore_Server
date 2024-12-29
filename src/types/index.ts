import { HttpStatusCode } from "@/constant";
import { newAuthorSchema } from "@/validators/author.validation";
import { newBookSchema } from "@/validators/book/book.validation";
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
}

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type newBookBody = z.infer<typeof newBookSchema>;

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type CreateBookRequestHandler = RequestHandler<{}, {}, newBookBody>;

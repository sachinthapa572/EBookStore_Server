import { HttpStatusCode } from "@/constant";
import { newAuthorSchema } from "@/validators/author.validation";
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

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;

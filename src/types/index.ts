import { HttpStatusCode } from "@/constant";
import { RequestHandler, Response } from "express";
import { ZodRawShape } from "zod";

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

export interface IValidator {
  <T extends ZodRawShape>(obj: T): RequestHandler;
}


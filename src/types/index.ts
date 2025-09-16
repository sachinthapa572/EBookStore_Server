import type { Response } from "express";

import type { HttpStatusCode } from "@/constant";

export type SendMailOptionsI = {
  email: string;
  emailTemplate: string;
  res: Response;
};

export type IApiResponse<T> = {
  statusCode: number;
  data?: T;
  message: string;
  success: boolean;
};

export type IApiError = {
  statusCode: HttpStatusCode;
  success: boolean;
  message: string;
  errors?: string[];
  status: string;
  stack?: string | undefined;
};

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

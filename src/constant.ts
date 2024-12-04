export const DB_NAME: string = "E-BookStore";

// Api error class HttpStatusCode enum

export enum HttpStatusCode {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  SERVICEUNAVAILABLE = 503,
}

export const statusMessages: { [key in HttpStatusCode]: string } = {
  [HttpStatusCode.OK]: "OK",
  [HttpStatusCode.BadRequest]: "Bad Request",
  [HttpStatusCode.Unauthorized]: "Unauthorized",
  [HttpStatusCode.Forbidden]: "Forbidden",
  [HttpStatusCode.NotFound]: "Not Found",
  [HttpStatusCode.InternalServerError]: "Internal Server Error",
  [HttpStatusCode.SERVICEUNAVAILABLE]: "Service Unavailable",
};

export const cookiesOptions = {
  httpOnly: true,
  secure: true,
};

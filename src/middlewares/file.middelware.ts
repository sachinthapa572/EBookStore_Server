import { RequestHandler } from "express";

export const fileParser: RequestHandler = (req, _res, _next) => {
  const avatar = req.files.avatar;
  console.log(avatar);
};

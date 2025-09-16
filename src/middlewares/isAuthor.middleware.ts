import type { RequestHandler } from "express";

import { HttpStatusCode } from "@/constant";
import { ROLES } from "@/enum/role.enum";

export const isAuthor: RequestHandler = (req, res, next) => {
  if (req.user.role !== ROLES.AUTHOR) {
    res.status(HttpStatusCode.Forbidden).json({
      status: "error",
      message: "Access denied. This operation requires author privileges.",
      code: "UNAUTHORIZED_ACCESS",
    });
    return;
  }
  next();
};

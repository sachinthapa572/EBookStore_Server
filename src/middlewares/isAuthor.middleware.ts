import { ROLES } from "@/enum/role.enum";
import { RequestHandler } from "express";

export const isAuthor: RequestHandler = (req, res, next) => {
  if (req.user.role !== ROLES.AUTHOR) {
    res.status(403).json({
      status: "error",
      message: "Access denied. This operation requires author privileges.",
      code: "UNAUTHORIZED_ACCESS",
    });
    return;
  }
  next();
};

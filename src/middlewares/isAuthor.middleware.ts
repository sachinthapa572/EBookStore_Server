import { ROLES } from "@/enum/role.enum";
import { RequestHandler } from "express";

export const isAuthor: RequestHandler = (req, res, next) => {
  if (req.user.role !== ROLES.AUTHOR) {
    res.status(403).json({
      message: "You are not authorized to perform this action",
    });
    return;
  }
  next();
};

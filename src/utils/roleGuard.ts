import { RoleType } from "@/enum/role.enum";
import { Request } from "express";
import ApiError from "./ApiError";

const roleGuard = (req: Request, role: RoleType) => {
  if (!req.user) {
    throw new ApiError(404, "User not authenticated");
  }

  if (req.user.role !== role) {
    throw new ApiError(404, "Access denied: Insufficient permissions");
  }
};

export default roleGuard;
